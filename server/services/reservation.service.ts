import prisma from "@/lib/db";
import { computeTimeCharge } from "@/lib/pricing/time";

export interface CreateReservationInput {
  tableType: string;
  startTime: string; // ISO string
  durationHours: number;
  partySize?: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  notes?: string;
}

function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CQ-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class ReservationService {
  /**
   * Checks slot availability for a table type on a particular date.
   */
  static async checkAvailability(tableType: string, dateStr: string, durationHours: number) {
    const typeUpper = (tableType || "POOL").toUpperCase();

    const tables = await prisma.gameTable.findMany({
      where: { type: typeUpper },
      include: {
        rateCard: {
          include: { bands: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    if (tables.length === 0) {
      return { slots: [], totalTables: 0 };
    }

    const rateCard = tables[0].rateCard;
    const rateBands = rateCard.bands;

    const slots = [];
    const maxHour = 24 - durationHours;

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const existingReservations = await prisma.reservation.findMany({
      where: {
        tableType: typeUpper,
        status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
        startsAt: { lte: endOfDay },
        endsAt: { gte: startOfDay },
      },
    });

    for (let hour = 11; hour <= maxHour; hour++) {
      const slotStartTime = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00.000Z`);
      const slotEndTime = new Date(slotStartTime.getTime() + durationHours * 3600000);

      const conflicts = existingReservations.filter((res) => {
        const resStart = new Date(res.startsAt);
        const resEnd = new Date(res.endsAt);
        return resStart < slotEndTime && resEnd > slotStartTime;
      });

      const availableCount = Math.max(0, tables.length - conflicts.length);

      const priceResult = computeTimeCharge({
        start: slotStartTime,
        end: slotEndTime,
        pauses: [],
        bands: rateBands,
        rateCard: {
          graceMinutes: rateCard.graceMinutes,
          minChargeMinutes: rateCard.minChargeMinutes,
          overtimeMultiplier: rateCard.overtimeMultiplier,
        },
        timezone: "Asia/Kolkata",
      });

      const isHappyHourSlot = priceResult.breakdown.some((b) =>
        b.label.toLowerCase().includes("happy")
      );

      slots.push({
        hour,
        timeFormatted: `${String(hour).padStart(2, "0")}:00`,
        startTime: slotStartTime.toISOString(),
        endTime: slotEndTime.toISOString(),
        availableCount,
        isAvailable: availableCount > 0,
        estimatedTotalPaise: priceResult.totalPaise,
        depositPaise: Math.min(priceResult.totalPaise, 50000), // Standard deposit ₹500
        isHappyHour: isHappyHourSlot,
      });
    }

    return {
      date: dateStr,
      tableType: typeUpper,
      totalTables: tables.length,
      slots,
    };
  }

  /**
   * Creates a confirmed reservation with double-booking safety.
   */
  static async createReservation(input: CreateReservationInput) {
    const slotStart = new Date(input.startTime);
    const slotEnd = new Date(slotStart.getTime() + input.durationHours * 3600000);

    return await prisma.$transaction(async (tx) => {
      const candidateTables = await tx.gameTable.findMany({
        where: { type: input.tableType },
        include: {
          rateCard: { include: { bands: true } },
          reservations: {
            where: {
              status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
              startsAt: { lt: slotEnd },
              endsAt: { gt: slotStart },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      });

      const availableTable = candidateTables.find((t) => t.reservations.length === 0);
      if (!availableTable) {
        throw new Error("SLOT_FULL: No tables of this type available for the requested time");
      }

      const priceResult = computeTimeCharge({
        start: slotStart,
        end: slotEnd,
        pauses: [],
        bands: availableTable.rateCard.bands,
        rateCard: {
          graceMinutes: availableTable.rateCard.graceMinutes,
          minChargeMinutes: availableTable.rateCard.minChargeMinutes,
          overtimeMultiplier: availableTable.rateCard.overtimeMultiplier,
        },
        timezone: "Asia/Kolkata",
      });

      const depositPaise = Math.min(priceResult.totalPaise, 50000);
      const bookingCode = generateBookingCode();

      // Find or create customer
      let customer = await tx.customer.findUnique({
        where: { phone: input.guestPhone.trim() },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: input.guestName.trim(),
            phone: input.guestPhone.trim(),
            email: input.guestEmail?.trim() || null,
          },
        });
      }

      const reservation = await tx.reservation.create({
        data: {
          code: bookingCode,
          customerId: customer.id,
          tableId: availableTable.id,
          tableType: input.tableType,
          guestName: input.guestName.trim(),
          guestPhone: input.guestPhone.trim(),
          partySize: input.partySize || 2,
          startsAt: slotStart,
          endsAt: slotEnd,
          depositPaise,
          depositPaid: true,
          status: "CONFIRMED",
          notes: input.notes || null,
        },
        include: {
          table: true,
        },
      });

      await tx.notification.create({
        data: {
          channel: "WHATSAPP",
          to: input.guestPhone.trim(),
          body: `Your CueClub booking for ${availableTable.name} on ${slotStart.toLocaleDateString("en-IN")} at ${slotStart.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} is confirmed! Booking Code: ${bookingCode}`,
        },
      });

      return reservation;
    });
  }

  /**
   * Retrieves reservation by booking code and phone.
   */
  static async lookupReservation(code: string, phone: string) {
    const reservation = await prisma.reservation.findFirst({
      where: {
        code: code.toUpperCase().trim(),
        guestPhone: phone.trim(),
      },
      include: {
        table: true,
      },
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    const now = new Date();
    const startsAt = new Date(reservation.startsAt);
    const diffHours = (startsAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isRefundable = diffHours >= 2.0;

    return {
      reservation,
      isRefundable,
      hoursUntilStart: Math.max(0, Math.round(diffHours * 10) / 10),
    };
  }

  /**
   * Cancels a reservation.
   */
  static async cancelReservation(reservationId: string, reason?: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    const now = new Date();
    const startsAt = new Date(reservation.startsAt);
    const diffHours = (startsAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isRefundable = diffHours >= 2.0;

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED",
        notes: isRefundable
          ? `${reservation.notes || ""}\nCancelled: ${reason || "User request"} [Refundable deposit ₹${reservation.depositPaise / 100}]`.trim()
          : `${reservation.notes || ""}\nCancelled: ${reason || "User request"} [Non-refundable deposit]`.trim(),
      },
    });

    return {
      reservation: updated,
      isRefundable,
    };
  }

  /**
   * Admin Gantt view: fetches all tables and reservations for a given calendar date.
   */
  static async getGanttSchedule(dateStr: string) {
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const tables = await prisma.gameTable.findMany({
      orderBy: { sortOrder: "asc" },
    });

    const reservations = await prisma.reservation.findMany({
      where: {
        startsAt: { lte: endOfDay },
        endsAt: { gte: startOfDay },
      },
      include: {
        table: true,
        customer: true,
      },
      orderBy: { startsAt: "asc" },
    });

    return {
      date: dateStr,
      tables,
      reservations,
    };
  }

  /**
   * Check in a reservation to floor, starting a live session on table.
   */
  static async checkInToFloor(reservationId: string, targetTableId?: string, staffUserId?: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { table: { include: { rateCard: { include: { bands: true } } } } },
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    const assignedTableId = targetTableId || reservation.tableId;
    if (!assignedTableId) {
      throw new Error("No table assigned for check-in");
    }

    const table = await prisma.gameTable.findUnique({
      where: { id: assignedTableId },
      include: { rateCard: { include: { bands: true } } },
    });

    if (!table || table.status !== "AVAILABLE") {
      throw new Error(`Table ${table?.name || assignedTableId} is not available for check-in`);
    }

    return await prisma.$transaction(async (tx) => {
      const newSession = await tx.session.create({
        data: {
          tableId: assignedTableId,
          customerId: reservation.customerId,
          reservationId: reservation.id,
          billingMode: "TIME",
          rateCardSnapshot: JSON.stringify(table.rateCard),
          status: "RUNNING",
          startedAt: new Date(),
        },
      });

      await tx.gameTable.update({
        where: { id: assignedTableId },
        data: { status: "OCCUPIED" },
      });

      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: "CHECKED_IN",
          tableId: assignedTableId,
        },
      });

      if (staffUserId) {
        await tx.auditLog.create({
          data: {
            userId: staffUserId,
            action: "RESERVATION_CHECKED_IN",
            entity: "RESERVATION",
            entityId: reservation.id,
            meta: JSON.stringify({ sessionId: newSession.id, tableId: assignedTableId }),
          },
        });
      }

      return newSession;
    });
  }
}
