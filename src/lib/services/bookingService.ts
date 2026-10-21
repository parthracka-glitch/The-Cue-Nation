import { backendDataStore } from "./dataStore";
import { Booking, BookingStatus, BookingSource } from "@/types/database";
import { calculateAuthoritativePrice } from "./pricingService";
import { hashPin, generatePin, generateBookingCode } from "./crypto";
import { broadcastEvent } from "./realtimeEmitter";
import { logAuditEvent } from "./auditService";

export interface CreateBookingInput {
  tableId?: string;
  poolId?: string;
  startISO: string;
  endISO: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  userId?: string | null;
  source?: BookingSource;
  status?: BookingStatus;
  paymentMethod?: "online" | "pay_at_venue";
}

/**
 * Checks if interval [start, end) conflicts with any existing active booking for the table or pool
 */
export function checkTableAvailability(
  tableOrPoolId: string,
  startISO: string,
  endISO: string,
  excludeBookingId?: string
): { available: boolean; conflictingBooking?: Booking; reason?: string } {
  // Clean any expired temporary holds first
  const nowISO = new Date().toISOString();
  backendDataStore.temporaryReservations = backendDataStore.temporaryReservations.filter((r) => {
    return r.status === "active" && new Date(r.expires_at) > new Date(nowISO);
  });

  const table = backendDataStore.tables.find((t) => t.id === tableOrPoolId);
  const pool = backendDataStore.pools.find((p) => p.id === tableOrPoolId);

  if (!table && !pool) {
    return { available: false, reason: "Selected pool or table does not exist" };
  }
  if (pool && !pool.is_active) {
    return { available: false, reason: "Pool is currently inactive" };
  }
  if (table && !table.active) {
    return { available: false, reason: "Table is inactive" };
  }
  if ((table && table.status === "maintenance") || (pool && pool.status === "maintenance")) {
    return { available: false, reason: "Pool is currently undergoing maintenance" };
  }

  // Check pool closure
  const targetStartMs = new Date(startISO).getTime();
  const targetEndMs = new Date(endISO).getTime();
  if (isNaN(targetStartMs) || isNaN(targetEndMs)) {
    return { available: false, reason: "Invalid start or end date format" };
  }
  if (targetEndMs <= targetStartMs) {
    return { available: false, reason: "End time must be after start time" };
  }

  const conflictingClosure = backendDataStore.poolClosures.find((c) => {
    if (c.pool_id !== tableOrPoolId) return false;
    const cStart = new Date(c.start_datetime).getTime();
    const cEnd = new Date(c.end_datetime).getTime();
    return targetStartMs < cEnd && targetEndMs > cStart;
  });
  if (conflictingClosure) {
    return { available: false, reason: conflictingClosure.reason || "Pool is closed during this time" };
  }

  // Check overlap with active bookings
  const conflict = backendDataStore.bookings.find((b) => {
    const isMatching = b.table_id === tableOrPoolId || b.pool_id === tableOrPoolId;
    if (!isMatching) return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.status === "cancelled" || b.status === "expired" || b.status === "no_show") return false;

    // Parse [start, end)
    const clean = b.during.replace(/[\[\]\(\)"]/g, "");
    const [bStartStr, bEndStr] = clean.split(",");
    if (!bStartStr || !bEndStr) return false;

    const bStartMs = new Date(bStartStr).getTime();
    const bEndMs = new Date(bEndStr).getTime();

    return targetStartMs < bEndMs && targetEndMs > bStartMs;
  });

  if (conflict) {
    return {
      available: false,
      conflictingBooking: conflict,
      reason: "This time slot is already reserved for this pool",
    };
  }

  return { available: true };
}

/**
 * Creates temporary hold reservation for 5 minutes during checkout
 */
export function createTemporaryHold(
  poolId: string,
  startISO: string,
  endISO: string,
  customerId?: string
): { success: boolean; hold?: any; error?: string } {
  const availability = checkTableAvailability(poolId, startISO, endISO);
  if (!availability.available) {
    return { success: false, error: availability.reason || "Slot not available" };
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const hold = {
    id: `hold-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    pool_id: poolId,
    customer_id: customerId,
    start_datetime: startISO,
    end_datetime: endISO,
    expires_at: expiresAt,
    status: "active" as const,
  };

  backendDataStore.temporaryReservations.push(hold);
  broadcastEvent("SLOT_HELD", { hold });
  return { success: true, hold };
}

/**
 * Atomic booking creation on server with strict anti-conflict lock
 */
export function createBooking(input: CreateBookingInput): {
  success: boolean;
  booking?: Booking;
  rawPin?: string;
  error?: string;
} {
  const targetId = input.poolId || input.tableId || "main-pool";

  // 1. Validate availability server-side immediately before creating
  const availability = checkTableAvailability(targetId, input.startISO, input.endISO);
  if (!availability.available) {
    return { success: false, error: availability.reason || "Time slot is no longer available" };
  }

  // 2. Calculate price
  const pool = backendDataStore.pools.find((p) => p.id === targetId);
  const startMs = new Date(input.startISO).getTime();
  const endMs = new Date(input.endISO).getTime();
  const durationMins = Math.round((endMs - startMs) / (1000 * 60));
  const hourlyRate = pool?.hourly_rate || 350;
  const totalAmount = Math.round((hourlyRate * durationMins) / 60);

  // 3. Generate credentials
  const bookingCode = generateBookingCode();
  const rawPin = generatePin();
  const pinHash = hashPin(rawPin);
  const bookingId = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const startDate = new Date(input.startISO);
  const bookingDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;

  const newBooking: Booking = {
    id: bookingId,
    booking_code: bookingCode,
    table_id: targetId,
    pool_id: targetId,
    user_id: input.userId || null,
    guest_name: input.guestName.trim(),
    guest_phone: input.guestPhone.trim(),
    guest_email: input.guestEmail ? input.guestEmail.trim() : null,
    during: `["${input.startISO}","${input.endISO}"]`,
    booking_date: bookingDate,
    start_time: input.startISO,
    end_time: input.endISO,
    duration_minutes: durationMins,
    status: input.status || "confirmed",
    source: input.source || "online",
    pin_hash: pinHash,
    pin_attempts: 0,
    amount: totalAmount,
    created_at: new Date().toISOString(),
  };

  // 4. Upsert Customer record
  const existingCust = backendDataStore.customers.find((c) => c.mobile_number === input.guestPhone.trim());
  if (!existingCust) {
    backendDataStore.customers.push({
      id: `cust-${Date.now()}`,
      full_name: input.guestName.trim(),
      mobile_number: input.guestPhone.trim(),
      email: input.guestEmail ? input.guestEmail.trim() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // 5. Remove any temporary hold for this slot
  backendDataStore.temporaryReservations = backendDataStore.temporaryReservations.filter((r) => {
    return !(r.pool_id === targetId && r.start_datetime === input.startISO && r.end_datetime === input.endISO);
  });

  // 6. Save booking
  backendDataStore.bookings.unshift(newBooking);

  // 7. Update table/pool live status if starting now
  const table = backendDataStore.tables?.find((t) => t.id === targetId);
  const nowMs = Date.now();
  if (table && table.status === "free" && nowMs >= startMs && nowMs < endMs) {
    table.status = "booked";
  }
  if (pool && pool.status === "free" && nowMs >= startMs && nowMs < endMs) {
    pool.status = "booked";
  }

  // 8. Broadcast event & audit log
  broadcastEvent("BOOKING_CREATED", { booking: newBooking });
  logAuditEvent({
    actorId: input.userId || "GUEST",
    actorName: input.guestName,
    actorRole: input.userId ? "customer" : "guest",
    action: "BOOKING_CREATED",
    resourceType: "booking",
    resourceId: bookingId,
    details: {
      bookingCode,
      poolId: targetId,
      amount: totalAmount,
      during: newBooking.during,
      source: newBooking.source,
    },
  });

  return {
    success: true,
    booking: newBooking,
    rawPin,
  };
}

/**
 * Reschedule an existing booking
 */
export function rescheduleBooking(
  bookingId: string,
  newStartISO: string,
  newEndISO: string,
  actor: { id: string; name: string; role: string }
): { success: boolean; booking?: Booking; error?: string } {
  const booking = backendDataStore.bookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, error: "Booking not found" };
  if (booking.status !== "confirmed") {
    return { success: false, error: `Cannot reschedule a booking with status '${booking.status}'` };
  }

  const availability = checkTableAvailability(booking.table_id, newStartISO, newEndISO, bookingId);
  if (!availability.available) {
    return { success: false, error: availability.reason || "Slot not available" };
  }

  const oldInterval = booking.during;
  booking.during = `["${newStartISO}","${newEndISO}"]`;

  broadcastEvent("BOOKING_UPDATED", { booking });
  logAuditEvent({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "BOOKING_RESCHEDULED",
    resourceType: "booking",
    resourceId: bookingId,
    details: { oldInterval, newInterval: booking.during },
  });

  return { success: true, booking };
}

/**
 * Cancel a booking
 */
export function cancelBooking(
  bookingId: string,
  reason: string,
  actor: { id: string; name: string; role: string }
): { success: boolean; error?: string } {
  const booking = backendDataStore.bookings.find((b) => b.id === bookingId);
  if (!booking) return { success: false, error: "Booking not found" };
  if (booking.status === "completed" || booking.status === "cancelled") {
    return { success: false, error: `Booking already ${booking.status}` };
  }

  booking.status = "cancelled";

  // Check table status
  const table = backendDataStore.tables.find((t) => t.id === booking.table_id);
  if (table && table.status === "booked") {
    table.status = "free";
  }

  broadcastEvent("BOOKING_UPDATED", { booking });
  logAuditEvent({
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action: "BOOKING_CANCELLED",
    resourceType: "booking",
    resourceId: bookingId,
    details: { reason },
  });

  return { success: true };
}
