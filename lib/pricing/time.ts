import { RateBandData } from "@/lib/types";

export interface PauseInterval {
  pausedAt: Date | string | number;
  resumedAt?: Date | string | number | null;
}

export interface ComputeTimeChargeInput {
  start: Date | string | number;
  end: Date | string | number;
  pauses?: PauseInterval[];
  rateCard?: {
    graceMinutes?: number;
    minChargeMinutes?: number;
    overtimeMultiplier?: number;
    framePricePaise?: number | null;
  };
  bands: RateBandData[];
  timezone?: string;
  bookedMinutesAllowance?: number; // e.g. 60 min package/booking
}

export interface TimeChargeLineItem {
  label: string;
  minutes: number;
  ratePerHour: number; // in paise
  amountPaise: number; // in paise
  isOvertime?: boolean;
}

export interface TimeChargeResult {
  totalPaise: number;
  billableMinutes: number;
  rawDurationMinutes: number;
  pausedMinutes: number;
  breakdown: TimeChargeLineItem[];
}

/**
 * Returns the minute of the day (0-1439) and ISO day of week (1=Mon ... 7=Sun)
 * for a specific timestamp in the given timezone.
 */
export function getZonedTimeParts(date: Date, timeZone = "Asia/Kolkata") {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  });

  const parts = formatter.formatToParts(date);
  let hour = 0;
  let minute = 0;
  let weekdayStr = "Mon";

  for (const part of parts) {
    if (part.type === "hour") {
      hour = parseInt(part.value, 10);
    } else if (part.type === "minute") {
      minute = parseInt(part.value, 10);
    } else if (part.type === "weekday") {
      weekdayStr = part.value;
    }
  }

  // Handle midnight 24:00 edge case in some environments
  if (hour === 24) hour = 0;

  const minuteOfDay = hour * 60 + minute;
  const dayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  const dayOfWeek = dayMap[weekdayStr] || 1;
  return { minuteOfDay, dayOfWeek };
}

/**
 * Checks if a specific minute timestamp falls within any pause interval.
 */
function isTimestampPaused(timestampMs: number, pauses: PauseInterval[]): boolean {
  for (const pause of pauses) {
    const pauseStart = new Date(pause.pausedAt).getTime();
    const pauseEnd = pause.resumedAt ? new Date(pause.resumedAt).getTime() : Date.now();
    if (timestampMs >= pauseStart && timestampMs < pauseEnd) {
      return true;
    }
  }
  return false;
}

/**
 * Matches a specific day and minute to the appropriate rate band.
 */
export function findMatchingRateBand(
  dayOfWeek: number,
  minuteOfDay: number,
  bands: RateBandData[]
): RateBandData | undefined {
  // First attempt: exact match by day and time range [startMinute, endMinute)
  const exact = bands.find((b) => {
    const days = b.daysOfWeek.split(",").map((d) => parseInt(d.trim(), 10));
    return (
      days.includes(dayOfWeek) &&
      minuteOfDay >= b.startMinute &&
      minuteOfDay < b.endMinute
    );
  });

  if (exact) return exact;

  // Fallback 1: match by day
  const dayMatch = bands.find((b) => {
    const days = b.daysOfWeek.split(",").map((d) => parseInt(d.trim(), 10));
    return days.includes(dayOfWeek);
  });
  if (dayMatch) return dayMatch;

  // Fallback 2: first band available
  return bands[0];
}

/**
 * Pure function: Computes table time charges minute-by-minute,
 * prorating across rate band boundaries, subtracting pauses, and applying
 * grace, minimum charge, and overtime multiplier rules.
 */
export function computeTimeCharge(input: ComputeTimeChargeInput): TimeChargeResult {
  const {
    start,
    end,
    pauses = [],
    rateCard = {},
    bands = [],
    timezone = "Asia/Kolkata",
    bookedMinutesAllowance,
  } = input;

  const startTimeMs = new Date(start).getTime();
  const endTimeMs = new Date(end).getTime();

  if (endTimeMs <= startTimeMs) {
    return {
      totalPaise: 0,
      billableMinutes: 0,
      rawDurationMinutes: 0,
      pausedMinutes: 0,
      breakdown: [],
    };
  }

  const minChargeMinutes = rateCard.minChargeMinutes ?? 15;
  const graceMinutes = rateCard.graceMinutes ?? 5;
  const overtimeMultiplier = rateCard.overtimeMultiplier ?? 1.0;

  // 1. Step through minute by minute (each 60,000 ms step)
  const minuteStepMs = 60 * 1000;
  const totalMinutes = Math.max(1, Math.round((endTimeMs - startTimeMs) / minuteStepMs));

  let pausedMinutes = 0;
  // Accumulate unrounded paise per band
  interface BandAccumulator {
    label: string;
    ratePerHour: number;
    minutes: number;
    unroundedPaise: number;
    isOvertime: boolean;
  }
  const bandMap = new Map<string, BandAccumulator>();

  let billableMinutesCount = 0;

  for (let i = 0; i < totalMinutes; i++) {
    const minuteStartMs = startTimeMs + i * minuteStepMs;

    // Check if paused
    if (isTimestampPaused(minuteStartMs, pauses)) {
      pausedMinutes++;
      continue;
    }

    billableMinutesCount++;
    const minuteDate = new Date(minuteStartMs);
    const { minuteOfDay, dayOfWeek } = getZonedTimeParts(minuteDate, timezone);
    const band = findMatchingRateBand(dayOfWeek, minuteOfDay, bands);

    const ratePerHour = band ? band.ratePerHourPaise : 15000;
    const label = band ? band.label : "Standard";

    // Determine if this minute is within package allowance or overtime
    let isMinuteOvertime = false;
    let multiplier = 1.0;

    if (bookedMinutesAllowance !== undefined && bookedMinutesAllowance > 0) {
      if (billableMinutesCount > bookedMinutesAllowance) {
        // We are past allowance. Overtime applies unless within grace period at session end
        isMinuteOvertime = true;
        multiplier = overtimeMultiplier;
      }
    }

    const key = `${label}_${ratePerHour}_${isMinuteOvertime ? "OT" : "REG"}`;
    const current = bandMap.get(key) || {
      label: isMinuteOvertime ? `${label} (Overtime)` : label,
      ratePerHour,
      minutes: 0,
      unroundedPaise: 0,
      isOvertime: isMinuteOvertime,
    };

    current.minutes += 1;
    // Minute rate prorated
    current.unroundedPaise += (ratePerHour / 60) * multiplier;
    bandMap.set(key, current);
  }

  // 2. Handle Grace Minutes on Booked Allowance
  // "if a session ends within grace of a package/booked boundary, don't charge the overtime"
  if (bookedMinutesAllowance !== undefined && bookedMinutesAllowance > 0) {
    if (
      billableMinutesCount > bookedMinutesAllowance &&
      billableMinutesCount <= bookedMinutesAllowance + graceMinutes
    ) {
      // Waive overtime multiplier for the grace minutes
      bandMap.forEach((acc) => {
        if (acc.isOvertime) {
          // Revert overtime multiplier
          acc.unroundedPaise = (acc.ratePerHour / 60) * acc.minutes;
          acc.isOvertime = false;
          acc.label = acc.label.replace(" (Overtime)", "");
        }
      });
    }
  }

  // 3. Handle Min Charge Minutes
  // If session is non-zero but under minChargeMinutes (e.g., 10 min < 15 min),
  // bump billable minutes to minChargeMinutes at the rate of the primary band
  let finalBillableMinutes = billableMinutesCount;
  if (billableMinutesCount > 0 && billableMinutesCount < minChargeMinutes) {
    const shortageMinutes = minChargeMinutes - billableMinutesCount;
    finalBillableMinutes = minChargeMinutes;

    // Add shortage minutes to the first active band
    const firstKey = Array.from(bandMap.keys())[0];
    if (firstKey) {
      const firstAcc = bandMap.get(firstKey)!;
      firstAcc.minutes += shortageMinutes;
      firstAcc.unroundedPaise += (firstAcc.ratePerHour / 60) * shortageMinutes;
    }
  }

  // 4. Build final breakdown and round to nearest paise ONLY at the end
  const breakdown: TimeChargeLineItem[] = [];
  let totalPaise = 0;

  bandMap.forEach((acc) => {
    const roundedPaise = Math.round(acc.unroundedPaise);
    totalPaise += roundedPaise;
    breakdown.push({
      label: acc.label,
      minutes: acc.minutes,
      ratePerHour: acc.ratePerHour,
      amountPaise: roundedPaise,
      isOvertime: acc.isOvertime,
    });
  });

  return {
    totalPaise,
    billableMinutes: finalBillableMinutes,
    rawDurationMinutes: totalMinutes,
    pausedMinutes,
    breakdown,
  };
}
