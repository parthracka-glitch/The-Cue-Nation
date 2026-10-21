import { backendDataStore } from "./dataStore";
import { Session, Bill } from "@/types/database";
import { hashPin } from "./crypto";
import { broadcastEvent } from "./realtimeEmitter";
import { logAuditEvent } from "./auditService";

export interface StartSessionInput {
  tableId: string;
  pin?: string;
  bookingCode?: string;
  isWalkIn?: boolean;
  actor: { id: string; name: string; role: string };
}

export function startSession(input: StartSessionInput): {
  success: boolean;
  session?: Session;
  error?: string;
} {
  const table =
    backendDataStore.tables?.find((t) => t.id === input.tableId) ||
    (backendDataStore.pools?.find((p) => p.id === input.tableId) as any);
  if (!table) return { success: false, error: "Table not found" };
  if (table.status === "maintenance") return { success: false, error: "Table is under maintenance" };

  // Check if session already active on table
  const existingActive = backendDataStore.sessions.find(
    (s) => s.table_id === input.tableId && !s.ended_at
  );
  if (existingActive) {
    return { success: false, error: "An active playing session is already running on this table" };
  }

  let bookingId = "";

  if (input.isWalkIn) {
    // Create an immediate walk-in booking record
    bookingId = `bk-walkin-${Date.now()}`;
    const nowISO = new Date().toISOString();
    const endISO = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const walkInRate =
      table.type === "snooker"
        ? backendDataStore.settings.snooker_hourly_rate
        : backendDataStore.settings.pool_hourly_rate;

    backendDataStore.bookings.unshift({
      id: bookingId,
      booking_code: `WI-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      table_id: table.id,
      guest_name: "Walk-in Guest",
      guest_phone: "",
      during: `["${nowISO}","${endISO}"]`,
      status: "checked_in",
      source: "offline",
      pin_hash: "",
      pin_attempts: 0,
      amount: walkInRate,
      created_at: nowISO,
    });
  } else {
    // Find matching booking
    let booking = backendDataStore.bookings.find(
      (b) =>
        b.table_id === input.tableId &&
        (b.status === "confirmed" || b.status === "checked_in")
    );

    if (input.bookingCode) {
      const matchByCode = backendDataStore.bookings.find(
        (b) => b.booking_code.toUpperCase() === input.bookingCode!.trim().toUpperCase()
      );
      if (matchByCode) booking = matchByCode;
    }

    // Also look up by PIN if booking not found yet
    if (!booking && input.pin) {
      const pinHashed = hashPin(input.pin.trim());
      booking = backendDataStore.bookings.find((b) => b.pin_hash === pinHashed);
    }

    if (!booking) {
      return { success: false, error: "No confirmed reservation found for this table or PIN" };
    }

    if (booking.status === "completed") {
      return { success: false, error: "This booking has already been completed and billed" };
    }

    if (booking.status === "cancelled") {
      return { success: false, error: "This booking was cancelled and is ineligible for check-in" };
    }

    const existingSessionForBooking = backendDataStore.sessions.find(
      (s) => s.booking_id === booking.id && !s.ended_at
    );
    if (existingSessionForBooking) {
      return { success: false, error: "This booking has already been checked in with an active session" };
    }

    // Verify PIN if provided
    if (input.pin && booking.pin_hash) {
      const pinHashed = hashPin(input.pin.trim());
      if (pinHashed !== booking.pin_hash) {
        booking.pin_attempts = (booking.pin_attempts || 0) + 1;
        return { success: false, error: `Invalid PIN (${3 - booking.pin_attempts} attempts remaining)` };
      }
    }

    booking.status = "checked_in";
    bookingId = booking.id;
  }

  // Create session
  const sessionId = `sess-${Date.now()}`;
  const now = new Date();
  const newSession: Session = {
    id: sessionId,
    booking_id: bookingId,
    table_id: table.id,
    started_at: now.toISOString(),
    ended_at: null,
    extra_minutes: 0,
    time_charge: table.type === "snooker" ? 500 : 350,
  };

  backendDataStore.sessions.push(newSession);
  table.status = "running";

  broadcastEvent("SESSION_STARTED", { session: newSession, tableId: table.id });
  broadcastEvent("TABLE_STATUS_CHANGED", { tableId: table.id, status: "running" });

  logAuditEvent({
    actorId: input.actor.id,
    actorName: input.actor.name,
    actorRole: input.actor.role,
    action: "SESSION_STARTED",
    resourceType: "session",
    resourceId: sessionId,
    details: { tableId: table.id, bookingId, startedAt: newSession.started_at },
  });

  return { success: true, session: newSession };
}

/**
 * Extend active session with future conflict detection
 */
export function extendSession(
  sessionId: string,
  extraMinutes: number,
  actor: { id: string; name: string; role: string }
): { success: boolean; session?: Session; error?: string } {
  const session = backendDataStore.sessions.find((s) => s.id === sessionId && !s.ended_at);
  if (!session) return { success: false, error: "Active session not found" };

  const table = backendDataStore.tables.find((t) => t.id === session.table_id);
  const nowMs = Date.now();
  const sessionStartMs = new Date(session.started_at).getTime();
  const currentTotalDurationMs = (60 + (session.extra_minutes || 0) + extraMinutes) * 60 * 1000;
  const projectedEndMs = sessionStartMs + currentTotalDurationMs;

  // Check if projected end overlaps with future bookings on this table
  const hasFutureConflict = backendDataStore.bookings.some((b) => {
    if (b.table_id !== session.table_id) return false;
    if (b.id === session.booking_id) return false;
    if (b.status === "cancelled" || b.status === "completed" || b.status === "no_show") return false;

    const clean = b.during.replace(/[\[\]\(\)"]/g, "");
    const [bStartStr] = clean.split(",");
    if (!bStartStr) return false;

    const bStartMs = new Date(bStartStr).getTime();
    // If the next booking starts before our extended end time, there's a conflict
    return bStartMs > nowMs && bStartMs < projectedEndMs;
  });

  if (hasFutureConflict) {
    return {
      success: false,
      error: `Cannot extend by ${extraMinutes} mins: an upcoming reservation is booked on this table`,
    };
  }

  session.extra_minutes = (session.extra_minutes || 0) + extraMinutes;
  const extraHourlyRate = (table?.type === "snooker" ? 500 : 350) / 60;
  session.time_charge += Math.round(extraMinutes * extraHourlyRate);

  broadcastEvent("SESSION_EXTENDED", { session });
  logAuditEvent({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "SESSION_EXTENDED",
    resourceType: "session",
    resourceId: sessionId,
    details: { addedMinutes: extraMinutes, totalExtraMinutes: session.extra_minutes },
  });

  return { success: true, session };
}

/**
 * End an active playing session and generate authoritative bill
 */
export function endSession(
  sessionId: string,
  actor: { id: string; name: string; role: string }
): { success: boolean; bill?: Bill; session?: Session; error?: string } {
  const session = backendDataStore.sessions.find((s) => s.id === sessionId && !s.ended_at);
  if (!session) return { success: false, error: "Active session not found" };

  session.ended_at = new Date().toISOString();

  const table = backendDataStore.tables.find((t) => t.id === session.table_id);
  if (table) {
    table.status = "free";
  }

  const booking = backendDataStore.bookings.find((b) => b.id === session.booking_id);
  if (booking) {
    booking.status = "completed";
  }

  // Calculate served café food total
  let foodTotal = 0;
  const sessionOrders = backendDataStore.orders.filter((o) => o.session_id === sessionId);
  sessionOrders.forEach((order) => {
    if (order.status === "served") {
      order.items?.forEach((item) => {
        foodTotal += item.price * item.qty;
      });
    }
  });

  const billId = `bill-${Date.now()}`;
  const total = session.time_charge + foodTotal;

  const newBill: Bill = {
    id: billId,
    session_id: sessionId,
    time_charge: session.time_charge,
    food_charge: foodTotal,
    total,
    paid: false,
    pay_mode: null,
    paid_at: null,
  };

  backendDataStore.bills.push(newBill);

  broadcastEvent("SESSION_ENDED", { session, bill: newBill });
  if (table) {
    broadcastEvent("TABLE_STATUS_CHANGED", { tableId: table.id, status: "free" });
  }

  logAuditEvent({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "SESSION_ENDED",
    resourceType: "session",
    resourceId: sessionId,
    details: {
      tableId: session.table_id,
      timeCharge: session.time_charge,
      foodCharge: foodTotal,
      billId,
      total,
    },
  });

  return { success: true, bill: newBill, session };
}
