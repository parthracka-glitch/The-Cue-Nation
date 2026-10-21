/**
 * Time and slot calculation helpers strictly grounded in Asia/Kolkata (IST)
 */

export const VENUE_TIMEZONE = "Asia/Kolkata";

export function formatTimeIST(dateInput: string | Date | number): string {
  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: VENUE_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatDateIST(dateInput: string | Date | number): string {
  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: VENUE_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTimeIST(dateInput: string | Date | number): string {
  return `${formatDateIST(dateInput)} at ${formatTimeIST(dateInput)}`;
}

/**
 * Generate hourly booking slots for a given day (10:00 AM to 1:00 AM next day)
 */
export interface TimeSlot {
  id: string;
  startISO: string;
  endISO: string;
  displayStart: string;
  displayEnd: string;
  label: string;
  isPeak: boolean;
}

export function generateDaySlots(targetDate: Date = new Date()): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Clone date and set to IST calendar date
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();

  // Slots from 10:00 AM (10) to 12:00 AM (24) -> 14 slots
  for (let hour = 10; hour <= 23; hour++) {
    const slotStart = new Date(year, month, day, hour, 0, 0, 0);
    const slotEnd = new Date(year, month, day, hour + 1, 0, 0, 0);

    const isPeak = hour >= 18; // 6 PM onwards is Peak hours
    slots.push({
      id: `slot-${hour}`,
      startISO: slotStart.toISOString(),
      endISO: slotEnd.toISOString(),
      displayStart: formatTimeIST(slotStart),
      displayEnd: formatTimeIST(slotEnd),
      label: `${formatTimeIST(slotStart)} - ${formatTimeIST(slotEnd)}`,
      isPeak,
    });
  }

  // 12:00 AM to 01:00 AM late night slot
  const midnightStart = new Date(year, month, day + 1, 0, 0, 0, 0);
  const midnightEnd = new Date(year, month, day + 1, 1, 0, 0, 0);
  slots.push({
    id: `slot-24`,
    startISO: midnightStart.toISOString(),
    endISO: midnightEnd.toISOString(),
    displayStart: formatTimeIST(midnightStart),
    displayEnd: formatTimeIST(midnightEnd),
    label: `${formatTimeIST(midnightStart)} - ${formatTimeIST(midnightEnd)}`,
    isPeak: true,
  });

  return slots;
}

/**
 * Helper to check if a slot overlaps with a given PostgreSQL tstzrange string
 * e.g., '["2026-10-20T14:00:00+00:00","2026-10-20T15:00:00+00:00")'
 */
export function checkRangeOverlap(slotStartISO: string, slotEndISO: string, rangeString: string): boolean {
  try {
    const clean = rangeString.replace(/[\[\]\(\)"]/g, "");
    const parts = clean.split(",");
    if (parts.length < 2) return false;
    const rangeStart = new Date(parts[0]!).getTime();
    const rangeEnd = new Date(parts[1]!).getTime();
    const slotStart = new Date(slotStartISO).getTime();
    const slotEnd = new Date(slotEndISO).getTime();

    return slotStart < rangeEnd && slotEnd > rangeStart;
  } catch {
    return false;
  }
}
