import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { cancelBooking, rescheduleBooking } from "@/lib/services/bookingService";
import { authenticateRequest } from "@/lib/services/authService";
import { broadcastEvent } from "@/lib/services/realtimeEmitter";
import { logAuditEvent } from "@/lib/services/auditService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = backendDataStore.bookings.find(
      (b) => b.id === id || b.booking_code.toUpperCase() === id.toUpperCase()
    );

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const table = backendDataStore.tables.find((t) => t.id === booking.table_id || t.id === booking.pool_id);
    const session = backendDataStore.sessions.find((s) => s.booking_id === booking.id);

    return NextResponse.json({
      booking,
      table,
      session,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch booking";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader) || {
    id: "ANON",
    name: "Customer/Guest",
    role: "customer" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const { action, reason, newStartISO, newEndISO } = body;

    if (action === "cancel") {
      const result = cancelBooking(id, reason || "Cancelled by user", user);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Booking cancelled" });
    }

    if (action === "reschedule") {
      if (!newStartISO || !newEndISO) {
        return NextResponse.json({ error: "newStartISO and newEndISO are required" }, { status: 400 });
      }
      const result = rescheduleBooking(id, newStartISO, newEndISO, user);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 409 });
      }
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, note } = body;

    const booking = backendDataStore.bookings.find(
      (b) => b.id === id || b.booking_code.toUpperCase() === id.toUpperCase()
    );
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const oldStatus = booking.status;
    if (status) {
      booking.status = status;
    }

    if (status === "cancelled" || status === "completed") {
      const table = backendDataStore.tables.find(
        (t) => t.id === booking.table_id || t.id === booking.pool_id
      );
      if (table && table.status === "booked") {
        table.status = "free";
      }
      const pool = backendDataStore.pools.find(
        (p) => p.id === booking.table_id || p.id === booking.pool_id
      );
      if (pool && pool.status === "booked") {
        pool.status = "free";
      }
    }

    broadcastEvent("BOOKING_UPDATED", { booking });
    logAuditEvent({
      actorId: "STAFF",
      actorName: "Floor Staff",
      actorRole: "staff",
      action: "BOOKING_STATUS_CHANGED",
      resourceType: "booking",
      resourceId: booking.id,
      details: {
        bookingCode: booking.booking_code,
        oldStatus,
        newStatus: booking.status,
        note,
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update booking";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = backendDataStore.bookings.find(
      (b) => b.id === id || b.booking_code.toUpperCase() === id.toUpperCase()
    );
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    booking.status = "cancelled";

    const table = backendDataStore.tables.find(
      (t) => t.id === booking.table_id || t.id === booking.pool_id
    );
    if (table && table.status === "booked") {
      table.status = "free";
    }

    broadcastEvent("BOOKING_CANCELLED", { bookingId: booking.id });
    return NextResponse.json({ success: true, message: "Booking cancelled and slot released" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to cancel booking";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
