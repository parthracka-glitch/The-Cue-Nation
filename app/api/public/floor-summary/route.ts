import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const tables = await prisma.gameTable.findMany({
      include: {
        rateCard: {
          include: { bands: true },
        },
        sessions: {
          where: { status: { in: ["RUNNING", "PAUSED"] } },
          select: {
            id: true,
            status: true,
            startedAt: true,
            framesPlayed: true,
            customer: { select: { name: true } },
          },
          take: 1,
        },
        reservations: {
          where: {
            status: { in: ["CONFIRMED", "PENDING"] },
            endsAt: { gte: now },
            startsAt: { lte: oneHourLater },
          },
          select: {
            id: true,
            code: true,
            startsAt: true,
            endsAt: true,
            guestName: true,
            status: true,
          },
          orderBy: { startsAt: "asc" },
          take: 1,
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const counts: Record<string, { total: number; available: number; occupied: number; reserved: number }> = {
      POOL: { total: 0, available: 0, occupied: 0, reserved: 0 },
      SNOOKER: { total: 0, available: 0, occupied: 0, reserved: 0 },
      CAROM: { total: 0, available: 0, occupied: 0, reserved: 0 },
    };

    let totalAll = 0;
    let availableAll = 0;
    let occupiedAll = 0;

    const formattedTables = tables.map((t) => {
      const activeSession = t.sessions[0];
      const nextReservation = t.reservations[0];

      let effectiveStatus = t.status;
      if (activeSession) {
        effectiveStatus = "OCCUPIED";
      } else if (nextReservation && new Date(nextReservation.startsAt) <= now) {
        effectiveStatus = "RESERVED";
      }

      if (counts[t.type]) {
        counts[t.type].total++;
        if (effectiveStatus === "AVAILABLE") counts[t.type].available++;
        else if (effectiveStatus === "OCCUPIED") counts[t.type].occupied++;
        else if (effectiveStatus === "RESERVED") counts[t.type].reserved++;
      }

      totalAll++;
      if (effectiveStatus === "AVAILABLE") availableAll++;
      if (effectiveStatus === "OCCUPIED") occupiedAll++;

      // Default hourly rate band
      const primaryBand = t.rateCard.bands[0];
      const ratePerHourPaise = primaryBand ? primaryBand.ratePerHourPaise : 30000;

      // Elapsed minutes for active session
      let elapsedMinutes = 0;
      if (activeSession) {
        elapsedMinutes = Math.max(0, Math.floor((now.getTime() - new Date(activeSession.startedAt).getTime()) / 60000));
      }

      return {
        id: t.id,
        name: t.name,
        type: t.type,
        status: effectiveStatus,
        rateCardName: t.rateCard.name,
        ratePerHourPaise,
        hasActiveSession: !!activeSession,
        elapsedMinutes,
        framesPlayed: activeSession?.framesPlayed || 0,
        hasUpcomingReservation: !!nextReservation,
        reservationStart: nextReservation ? nextReservation.startsAt : null,
      };
    });

    return NextResponse.json({
      timestamp: now.toISOString(),
      summary: {
        totalTables: totalAll,
        availableTables: availableAll,
        occupiedTables: occupiedAll,
        occupancyRate: totalAll > 0 ? Math.round((occupiedAll / totalAll) * 100) : 0,
        byType: counts,
      },
      tables: formattedTables,
    });
  } catch (error: any) {
    console.error("Public floor summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch floor status" },
      { status: 500 }
    );
  }
}
