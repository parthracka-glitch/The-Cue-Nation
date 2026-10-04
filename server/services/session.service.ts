import prisma from "@/lib/db";
import { computeTimeCharge } from "@/lib/pricing/time";
import { logAudit } from "../utils/audit";

export interface StartSessionInput {
  tableId: string;
  customerId?: string | null;
  walkInName?: string;
  walkInPhone?: string;
  billingMode?: string;
  packageDealId?: string | null;
  reservationId?: string | null;
  createdById?: string;
}

export class SessionService {
  /**
   * Retrieves live floor state including tables, active running sessions,
   * live elapsed durations, prorated charges, and upcoming reservations.
   */
  static async getFloorState() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const tables = await prisma.gameTable.findMany({
      include: {
        rateCard: {
          include: { bands: true },
        },
        sessions: {
          where: { status: { in: ["RUNNING", "PAUSED"] } },
          include: {
            customer: true,
            packageDeal: true,
            pauses: { orderBy: { pausedAt: "asc" } },
            orders: {
              where: { status: { not: "CANCELLED" } },
              include: { items: true },
            },
          },
          take: 1,
        },
        reservations: {
          where: {
            status: { in: ["CONFIRMED", "PENDING"] },
            endsAt: { gte: now },
          },
          orderBy: { startsAt: "asc" },
          take: 1,
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ["CONFIRMED", "PENDING"] },
        startsAt: { gte: now, lte: oneHourLater },
      },
      include: { table: true },
      orderBy: { startsAt: "asc" },
    });

    const todayBills = await prisma.bill.findMany({
      where: {
        closedAt: { gte: startOfToday },
        status: "PAID",
      },
      select: { totalPaise: true },
    });

    const todayRevenuePaise = todayBills.reduce((acc, b) => acc + b.totalPaise, 0);

    const enrichedTables = tables.map((tbl) => {
      const activeSession = tbl.sessions[0] || null;
      let elapsedMinutes = 0;
      let runningTimeChargePaise = 0;
      let runningFoodChargePaise = 0;

      if (activeSession) {
        const start = new Date(activeSession.startedAt);
        const diffMs = Math.max(0, now.getTime() - start.getTime());
        const rawMinutes = Math.floor(diffMs / 60000);

        const totalPauseMinutes = activeSession.pauses.reduce((acc, p) => {
          const pStart = new Date(p.pausedAt);
          const pEnd = p.resumedAt ? new Date(p.resumedAt) : now;
          return acc + Math.max(0, Math.floor((pEnd.getTime() - pStart.getTime()) / 60000));
        }, 0);

        elapsedMinutes = Math.max(0, rawMinutes - totalPauseMinutes);

        if (tbl.rateCard) {
          const calc = computeTimeCharge({
            start,
            end: now,
            pauses: activeSession.pauses.map((p) => ({
              pausedAt: new Date(p.pausedAt),
              resumedAt: p.resumedAt ? new Date(p.resumedAt) : now,
            })),
            bands: tbl.rateCard.bands,
            rateCard: {
              graceMinutes: tbl.rateCard.graceMinutes,
              minChargeMinutes: tbl.rateCard.minChargeMinutes,
              overtimeMultiplier: tbl.rateCard.overtimeMultiplier,
            },
            timezone: "Asia/Kolkata",
          });
          runningTimeChargePaise = calc.totalPaise;
        }

        runningFoodChargePaise = activeSession.orders.reduce((sum, ord) => {
          return sum + ord.items.reduce((iSum, itm) => iSum + itm.unitPricePaise * itm.quantity, 0);
        }, 0);
      }

      const nextRes = tbl.reservations[0] || null;

      return {
        id: tbl.id,
        name: tbl.name,
        type: tbl.type,
        status: tbl.status,
        activeSession: activeSession
          ? {
              id: activeSession.id,
              startedAt: activeSession.startedAt,
              status: activeSession.status,
              billingMode: activeSession.billingMode,
              customerName: activeSession.customer?.name || "Walk-In Guest",
              customerPhone: activeSession.customer?.phone || null,
              elapsedMinutes,
              runningTimeChargePaise,
              runningFoodChargePaise,
              totalRunningChargePaise: runningTimeChargePaise + runningFoodChargePaise,
              activeOrdersCount: activeSession.orders.length,
            }
          : null,
        nextReservation: nextRes
          ? {
              id: nextRes.id,
              code: nextRes.code,
              guestName: nextRes.guestName,
              startsAt: nextRes.startsAt,
              endsAt: nextRes.endsAt,
            }
          : null,
      };
    });

    const activeCount = enrichedTables.filter((t) => t.status === "OCCUPIED" || t.status === "PAUSED").length;

    return {
      tables: enrichedTables,
      summary: {
        totalTables: enrichedTables.length,
        activeTables: activeCount,
        availableTables: enrichedTables.filter((t) => t.status === "AVAILABLE").length,
        dirtyTables: enrichedTables.filter((t) => t.status === "DIRTY").length,
        occupancyRate: enrichedTables.length > 0 ? Math.round((activeCount / enrichedTables.length) * 100) : 0,
        todayRevenuePaise,
      },
      upcomingReservations: upcomingReservations.map((r) => ({
        id: r.id,
        code: r.code,
        tableName: r.table?.name || "Unassigned",
        guestName: r.guestName,
        guestPhone: r.guestPhone,
        startsAt: r.startsAt,
        depositPaise: r.depositPaise,
      })),
    };
  }

  /**
   * Starts a new playing session on a table.
   */
  static async startSession(input: StartSessionInput) {
    const { tableId, customerId, walkInName, walkInPhone, billingMode = "TIME", packageDealId, reservationId } = input;

    const table = await prisma.gameTable.findUnique({
      where: { id: tableId },
      include: { rateCard: { include: { bands: true } } },
    });

    if (!table) {
      throw new Error("Table not found");
    }

    if (table.status === "OCCUPIED" || table.status === "MAINTENANCE") {
      throw new Error(`Table is currently ${table.status}`);
    }

    let finalCustomerId = customerId;
    if (!finalCustomerId && walkInName) {
      const walkInPhoneNum = walkInPhone?.trim() || `walkin-${Date.now()}`;
      const customer = await prisma.customer.upsert({
        where: { phone: walkInPhoneNum },
        update: { name: walkInName },
        create: {
          name: walkInName,
          phone: walkInPhoneNum,
        },
      });
      finalCustomerId = customer.id;
    }

    const rateCardSnapshot = JSON.stringify(table.rateCard);

    return await prisma.$transaction(async (tx) => {
      const newSession = await tx.session.create({
        data: {
          tableId,
          customerId: finalCustomerId || null,
          reservationId: reservationId || null,
          billingMode,
          packageDealId: packageDealId || null,
          rateCardSnapshot,
          status: "RUNNING",
          startedAt: new Date(),
        },
        include: {
          table: true,
          customer: true,
        },
      });

      await tx.gameTable.update({
        where: { id: tableId },
        data: { status: "OCCUPIED" },
      });

      if (reservationId) {
        await tx.reservation.update({
          where: { id: reservationId },
          data: { status: "CHECKED_IN", tableId },
        });
      }

      await logAudit(
        {
          userId: input.createdById,
          action: "SESSION_START",
          entity: "SESSION",
          entityId: newSession.id,
          meta: { tableId, customerId: finalCustomerId, billingMode },
        },
        tx
      );

      return newSession;
    });
  }

  /**
   * Pauses an active session.
   */
  static async pauseSession(sessionId: string, reason?: string, userId?: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { table: true },
    });

    if (!session || session.status !== "RUNNING") {
      throw new Error("Active running session not found");
    }

    return await prisma.$transaction(async (tx) => {
      await tx.sessionPause.create({
        data: {
          sessionId,
          pausedAt: new Date(),
        },
      });

      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: { status: "PAUSED" },
      });

      await tx.gameTable.update({
        where: { id: session.tableId },
        data: { status: "PAUSED" },
      });

      await logAudit(
        {
          userId,
          action: "SESSION_PAUSE",
          entity: "SESSION",
          entityId: sessionId,
          meta: { reason },
        },
        tx
      );

      return updatedSession;
    });
  }

  /**
   * Resumes a paused session.
   */
  static async resumeSession(sessionId: string, userId?: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { pauses: { where: { resumedAt: null }, orderBy: { pausedAt: "desc" }, take: 1 } },
    });

    if (!session || session.status !== "PAUSED") {
      throw new Error("Paused session not found");
    }

    return await prisma.$transaction(async (tx) => {
      const activePause = session.pauses[0];
      if (activePause) {
        await tx.sessionPause.update({
          where: { id: activePause.id },
          data: { resumedAt: new Date() },
        });
      }

      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: { status: "RUNNING" },
      });

      await tx.gameTable.update({
        where: { id: session.tableId },
        data: { status: "OCCUPIED" },
      });

      await logAudit(
        {
          userId,
          action: "SESSION_RESUME",
          entity: "SESSION",
          entityId: sessionId,
          meta: { pauseId: activePause?.id },
        },
        tx
      );

      return updatedSession;
    });
  }

  /**
   * Switches an active session to a different game table.
   */
  static async switchTable(sessionId: string, targetTableId: string, reason?: string, userId?: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { table: true },
    });

    if (!session || (session.status !== "RUNNING" && session.status !== "PAUSED")) {
      throw new Error("Active session not found");
    }

    const targetTable = await prisma.gameTable.findUnique({
      where: { id: targetTableId },
    });

    if (!targetTable || targetTable.status !== "AVAILABLE") {
      throw new Error("Target table is not available for transfer");
    }

    return await prisma.$transaction(async (tx) => {
      const oldTableId = session.tableId;

      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: { tableId: targetTableId },
      });

      await tx.gameTable.update({
        where: { id: oldTableId },
        data: { status: "DIRTY" },
      });

      await tx.gameTable.update({
        where: { id: targetTableId },
        data: { status: session.status },
      });

      await logAudit(
        {
          userId,
          action: "SESSION_TABLE_SWITCH",
          entity: "SESSION",
          entityId: sessionId,
          meta: { fromTableId: oldTableId, toTableId: targetTableId, reason },
        },
        tx
      );

      return updatedSession;
    });
  }

  /**
   * Marks a dirty table as cleaned and available.
   */
  static async markTableClean(tableId: string, userId?: string) {
    const updated = await prisma.gameTable.update({
      where: { id: tableId },
      data: { status: "AVAILABLE" },
    });

    await logAudit({
      userId,
      action: "TABLE_CLEANED",
      entity: "GAME_TABLE",
      entityId: tableId,
      meta: { status: "AVAILABLE" },
    });

    return updated;
  }
}
