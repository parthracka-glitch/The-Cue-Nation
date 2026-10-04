export interface CustomerMembershipInfo {
  discountPercent: number; // e.g. 10 or 20
  includedMinutes?: number; // total included in plan (e.g. 300)
  minutesUsed?: number; // already consumed
  active?: boolean;
}

export interface ApplyMembershipInput {
  subtotalPaise: number;
  tableChargePaise: number;
  sessionBillableMinutes?: number;
  membership?: CustomerMembershipInfo | null;
}

export interface MembershipDiscountResult {
  discountPaise: number;
  tableChargeAfterDiscountPaise: number;
  includedMinutesConsumed: number;
  remainingMinutesAfterSession: number;
  effectiveDiscountPercent: number;
}

export function applyMembership({
  subtotalPaise: _subtotalPaise,
  tableChargePaise,
  sessionBillableMinutes = 0,
  membership,
}: ApplyMembershipInput): MembershipDiscountResult {
  if (!membership || membership.active === false) {
    return {
      discountPaise: 0,
      tableChargeAfterDiscountPaise: tableChargePaise,
      includedMinutesConsumed: 0,
      remainingMinutesAfterSession: 0,
      effectiveDiscountPercent: 0,
    };
  }

  const { discountPercent = 0, includedMinutes = 0, minutesUsed = 0 } = membership;

  // 1. Calculate included minutes consumption
  const availableMinutes = Math.max(0, includedMinutes - minutesUsed);
  const includedMinutesConsumed = Math.min(sessionBillableMinutes, availableMinutes);
  const remainingMinutesAfterSession = Math.max(0, availableMinutes - includedMinutesConsumed);

  // If table charge is prorated and part is covered by included minutes:
  let chargeableTableAmount = tableChargePaise;
  let includedMinutesValuePaise = 0;

  if (sessionBillableMinutes > 0 && includedMinutesConsumed > 0) {
    const minuteRatio = includedMinutesConsumed / sessionBillableMinutes;
    includedMinutesValuePaise = Math.round(tableChargePaise * minuteRatio);
    chargeableTableAmount = Math.max(0, tableChargePaise - includedMinutesValuePaise);
  }

  // 2. Apply percentage discount on remaining table time
  const percentDiscountPaise = Math.round((chargeableTableAmount * discountPercent) / 100);
  const totalDiscountPaise = includedMinutesValuePaise + percentDiscountPaise;

  const tableChargeAfterDiscountPaise = Math.max(0, tableChargePaise - totalDiscountPaise);

  return {
    discountPaise: totalDiscountPaise,
    tableChargeAfterDiscountPaise,
    includedMinutesConsumed,
    remainingMinutesAfterSession,
    effectiveDiscountPercent: discountPercent,
  };
}
