import { backendDataStore } from "./dataStore";
import { Pool, Booking, TemporaryReservation, PoolClosure } from "@/types/database";

export interface SlotStatusInfo {
  id: string;
  startISO: string;
  endISO: string;
  startTimeLabel: string;
  endTimeLabel: string;
  status: "available" | "booked" | "unavailable" | "reserved"; // Green, Red, Grey, Orange
  statusLabel: string;
  reason?: string;
  price: number;
}

export interface PoolDaySchedule {
  poolId: string;
  poolName: string;
  dateStr: string; // YYYY-MM-DD
  openingTime: string; // "10:00"
  closingTime: string; // "01:00"
  isCurrentlyClosed: boolean;
  nextOpeningTimeLabel?: string;
  noSlotsAvailable: boolean;
  slots: SlotStatusInfo[];
  summary: {
    totalSlots: number;
    availableCount: number;
    bookedCount: number;
    reservedCount: number;
    unavailableCount: number;
    nextAvailableSlot?: string;
  };
}

/**
 * Normalizes time strings into minutes from midnight (0 to 1440).
 * If closingTime < openingTime (e.g. 10:00 to 01:00), treats closing as extending past midnight (+1440).
 */
function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatMinutesToLabel(totalMins: number): string {
  const normMins = totalMins % 1440;
  const hours24 = Math.floor(normMins / 60);
  const minutes = normMins % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const mm = minutes.toString().padStart(2, "0");
  return `${hours12}:${mm} ${period}`;
}

export function cleanExpiredReservations() {
  const now = new Date().toISOString();
  backendDataStore.temporaryReservations = backendDataStore.temporaryReservations.filter((r) => {
    return r.status === "active" && new Date(r.expires_at) > new Date(now);
  });
}

/**
 * Calculates complete dynamic day schedule and slots for a given pool and date
 */
export function getPoolDaySchedule(
  poolId: string,
  targetDate: Date,
  durationMinutes: number = 60
): PoolDaySchedule {
  cleanExpiredReservations();

  // Find pool
  const pool = backendDataStore.pools.find((p) => p.id === poolId) || backendDataStore.pools[0];
  const poolIdResolved = pool ? pool.id : poolId;
  const poolName = pool ? pool.name : "CueNation Pool";

  const openingTime = pool?.opening_time || "10:00";
  const closingTime = pool?.closing_time || "01:00";
  const hourlyRate = pool?.hourly_rate || 350;

  // Format date YYYY-MM-DD
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const now = new Date();
  const isTargetToday =
    targetDate.getDate() === now.getDate() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getFullYear() === now.getFullYear();

  // Operating window in minutes from start of target day
  const openMins = parseTimeToMinutes(openingTime);
  let closeMins = parseTimeToMinutes(closingTime);
  if (closeMins <= openMins) {
    closeMins += 1440; // Closes next day past midnight
  }

  // Check if currently closed right now
  const nowMinsToday = now.getHours() * 60 + now.getMinutes();
  let isCurrentlyClosed = false;
  let nextOpeningTimeLabel: string | undefined = undefined;

  // Determine current closure state based on current time
  if (closeMins > 1440) {
    // Spans past midnight: open from openMins to midnight, OR midnight to (closeMins - 1440)
    const earlyMorningCutoff = closeMins - 1440;
    const isNowOpen = nowMinsToday >= openMins || nowMinsToday < earlyMorningCutoff;
    isCurrentlyClosed = !isNowOpen;
  } else {
    isCurrentlyClosed = nowMinsToday < openMins || nowMinsToday >= closeMins;
  }

  if (isCurrentlyClosed) {
    nextOpeningTimeLabel = `Opens at ${formatMinutesToLabel(openMins)}`;
  }

  // Closures & Maintenance for this pool
  const activeClosures = backendDataStore.poolClosures.filter((c) => c.pool_id === poolIdResolved);

  // Active confirmed and pending bookings for this pool
  const activeBookings = backendDataStore.bookings.filter((b) => {
    const isMatchingPool = b.pool_id === poolIdResolved || b.table_id === poolIdResolved;
    if (!isMatchingPool) return false;
    return (
      b.status === "confirmed" ||
      b.status === "pending" ||
      b.status === "checked_in" ||
      b.status === "completed"
    );
  });

  // Active temporary reservations
  const activeTempHolds = backendDataStore.temporaryReservations.filter((r) => {
    return r.pool_id === poolIdResolved && r.status === "active";
  });

  const slots: SlotStatusInfo[] = [];

  // Generate slots from openMins to closeMins
  for (let m = openMins; m + durationMinutes <= closeMins; m += durationMinutes) {
    // Compute start Date & end Date
    const slotStartDate = new Date(year, targetDate.getMonth(), targetDate.getDate());
    slotStartDate.setMinutes(m);

    const slotEndDate = new Date(year, targetDate.getMonth(), targetDate.getDate());
    slotEndDate.setMinutes(m + durationMinutes);

    const startISO = slotStartDate.toISOString();
    const endISO = slotEndDate.toISOString();
    const startTimeLabel = formatMinutesToLabel(m);
    const endTimeLabel = formatMinutesToLabel(m + durationMinutes);
    const slotPrice = Math.round((hourlyRate * durationMinutes) / 60);

    const slotStartMs = slotStartDate.getTime();
    const slotEndMs = slotEndDate.getTime();
    const nowMs = now.getTime();

    let status: "available" | "booked" | "unavailable" | "reserved" = "available";
    let statusLabel = "Available";
    let reason: string | undefined = undefined;

    // 1. Check if past time
    if (isTargetToday && slotStartMs <= nowMs) {
      status = "unavailable";
      statusLabel = "Time Passed";
      reason = "Slot time has already passed";
    }

    // 2. Check maintenance / closure
    if (status === "available") {
      const conflictingClosure = activeClosures.find((c) => {
        const cStart = new Date(c.start_datetime).getTime();
        const cEnd = new Date(c.end_datetime).getTime();
        return slotStartMs < cEnd && slotEndMs > cStart;
      });
      if (conflictingClosure) {
        status = "unavailable";
        statusLabel = "Maintenance / Closed";
        reason = conflictingClosure.reason || "Scheduled pool maintenance";
      }
    }

    // 3. Check existing confirmed/pending bookings
    if (status === "available") {
      const conflictBooking = activeBookings.find((b) => {
        const clean = b.during.replace(/[\[\]\(\)"]/g, "");
        const [bStartStr, bEndStr] = clean.split(",");
        if (!bStartStr || !bEndStr) return false;
        const bStartMs = new Date(bStartStr).getTime();
        const bEndMs = new Date(bEndStr).getTime();
        return slotStartMs < bEndMs && slotEndMs > bStartMs;
      });

      if (conflictBooking) {
        if (conflictBooking.status === "pending") {
          status = "reserved";
          statusLabel = "Pending Confirmation";
          reason = "A booking confirmation is currently in progress";
        } else {
          status = "booked";
          statusLabel = "Already Booked";
          reason = "Reserved by another customer";
        }
      }
    }

    // 4. Check temporary reservations (5-minute hold)
    if (status === "available") {
      const conflictHold = activeTempHolds.find((h) => {
        const hStart = new Date(h.start_datetime).getTime();
        const hEnd = new Date(h.end_datetime).getTime();
        return slotStartMs < hEnd && slotEndMs > hStart;
      });

      if (conflictHold) {
        status = "reserved";
        statusLabel = "Temporarily Reserved";
        reason = "A customer is currently checking out this slot";
      }
    }

    slots.push({
      id: `${poolIdResolved}-${startISO}`,
      startISO,
      endISO,
      startTimeLabel,
      endTimeLabel,
      status,
      statusLabel,
      reason,
      price: slotPrice,
    });
  }

  const totalSlots = slots.length;
  const availableCount = slots.filter((s) => s.status === "available").length;
  const bookedCount = slots.filter((s) => s.status === "booked").length;
  const reservedCount = slots.filter((s) => s.status === "reserved").length;
  const unavailableCount = slots.filter((s) => s.status === "unavailable").length;

  const firstAvailable = slots.find((s) => s.status === "available");
  const nextAvailableSlot = firstAvailable ? firstAvailable.startTimeLabel : undefined;

  return {
    poolId: poolIdResolved,
    poolName,
    dateStr,
    openingTime,
    closingTime,
    isCurrentlyClosed,
    nextOpeningTimeLabel,
    noSlotsAvailable: availableCount === 0,
    slots,
    summary: {
      totalSlots,
      availableCount,
      bookedCount,
      reservedCount,
      unavailableCount,
      nextAvailableSlot,
    },
  };
}
