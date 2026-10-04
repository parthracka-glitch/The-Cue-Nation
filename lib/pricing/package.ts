export interface ComputeFrameChargeInput {
  framesPlayed: number;
  framePricePaise: number;
}

export function computeFrameCharge({
  framesPlayed,
  framePricePaise,
}: ComputeFrameChargeInput): number {
  if (framesPlayed <= 0 || framePricePaise <= 0) return 0;
  return Math.round(framesPlayed * framePricePaise);
}

export interface PackageDealInfo {
  quantity: number; // hours or frames count
  pricePaise: number;
  billingMode: "TIME" | "FRAME" | string;
}

export interface ComputePackageUsageInput {
  minutesUsedOrFrames: number;
  package: PackageDealInfo;
  overtimeRatePaisePerUnit?: number; // e.g. rate per extra frame or rate per extra hour
}

export interface PackageUsageResult {
  includedUnitsUsed: number;
  remainingUnits: number;
  extraUnits: number;
  extraChargePaise: number;
  packagePricePaise: number;
  totalChargePaise: number;
}

export function computePackageUsage({
  minutesUsedOrFrames,
  package: pkg,
  overtimeRatePaisePerUnit = 0,
}: ComputePackageUsageInput): PackageUsageResult {
  const isTimeMode = pkg.billingMode === "TIME";
  // If time mode, package quantity is in hours -> convert to minutes
  const totalIncludedUnits = isTimeMode ? pkg.quantity * 60 : pkg.quantity;

  const used = Math.max(0, minutesUsedOrFrames);
  const includedUnitsUsed = Math.min(used, totalIncludedUnits);
  const remainingUnits = Math.max(0, totalIncludedUnits - used);
  const extraUnits = Math.max(0, used - totalIncludedUnits);

  let extraChargePaise = 0;
  if (extraUnits > 0 && overtimeRatePaisePerUnit > 0) {
    if (isTimeMode) {
      // prorated per minute from hourly rate
      extraChargePaise = Math.round((extraUnits * overtimeRatePaisePerUnit) / 60);
    } else {
      // per extra frame
      extraChargePaise = Math.round(extraUnits * overtimeRatePaisePerUnit);
    }
  }

  return {
    includedUnitsUsed,
    remainingUnits,
    extraUnits,
    extraChargePaise,
    packagePricePaise: pkg.pricePaise,
    totalChargePaise: pkg.pricePaise + extraChargePaise,
  };
}
