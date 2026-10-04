import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { ReservationService } from "@/server/services/reservation.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const result = await ReservationService.getGanttSchedule(dateStr);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load reservations" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action, tableId } = await req.json();

    if (action === "CHECK_IN") {
      const liveSession = await ReservationService.checkInToFloor(id, tableId, session.user.id);
      return NextResponse.json({ success: true, session: liveSession });
    }

    if (action === "NO_SHOW") {
      const updated = await prisma.reservation.update({
        where: { id },
        data: { status: "NO_SHOW" },
      });
      return NextResponse.json(updated);
    }

    if (action === "CANCEL") {
      const updated = await ReservationService.cancelReservation(id, "Cancelled by staff");
      return NextResponse.json(updated);
    }

    if (action === "CONFIRM") {
      const updated = await prisma.reservation.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });
      return NextResponse.json(updated);
    }

    if (action === "REASSIGN" && tableId) {
      const updated = await prisma.reservation.update({
        where: { id },
        data: { tableId },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Action failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guestName, guestPhone, tableId, tableType, startTime, durationHours = 1, partySize = 2 } =
      await req.json();

    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationHours * 3600000);

    const overlapping = await prisma.reservation.findFirst({
      where: {
        tableId,
        status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
        startsAt: { lt: end },
        endsAt: { gt: start },
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "This table already has an active booking for this time slot" },
        { status: 409 }
      );
    }

    const code = `CQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const reservation = await prisma.reservation.create({
      data: {
        code,
        guestName,
        guestPhone,
        tableId,
        tableType,
        startsAt: start,
        endsAt: end,
        partySize,
        status: "CONFIRMED",
        depositPaid: false,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Manual booking failed" },
      { status: 500 }
    );
  }
}
