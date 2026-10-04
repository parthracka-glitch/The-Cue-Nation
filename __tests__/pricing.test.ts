import { describe, it, expect } from "vitest";
import { computeTimeCharge } from "../lib/pricing/time";
import { computeFrameCharge, computePackageUsage } from "../lib/pricing/package";
import { applyMembership } from "../lib/pricing/membership";
import { computeTax, computeBillTotals } from "../lib/pricing/tax";

describe("Pricing Engine - Time & Band Calculations", () => {
  // Standard test rate bands (matching CueClub Pool Standard)
  const testBands = [
    // Mon-Thu Day (11:00 - 17:00 / 660 - 1020 min) = Rs 150/hr (15000 paise)
    {
      daysOfWeek: "1,2,3,4",
      startMinute: 660,
      endMinute: 1020,
      ratePerHourPaise: 15000,
      label: "Day Rate",
    },
    // Mon-Thu Happy Hour (17:00 - 20:00 / 1020 - 1200 min) = Rs 100/hr (10000 paise)
    {
      daysOfWeek: "1,2,3,4",
      startMinute: 1020,
      endMinute: 1200,
      ratePerHourPaise: 10000,
      label: "Happy Hour",
    },
    // Mon-Thu Evening (20:00 - 24:00 / 1200 - 1440 min) = Rs 250/hr (25000 paise)
    {
      daysOfWeek: "1,2,3,4",
      startMinute: 1200,
      endMinute: 1440,
      ratePerHourPaise: 25000,
      label: "Evening Peak",
    },
    // Fri-Sun Weekend Peak (11:00 - 24:00 / 660 - 1440 min) = Rs 300/hr (30000 paise)
    {
      daysOfWeek: "5,6,7",
      startMinute: 660,
      endMinute: 1440,
      ratePerHourPaise: 30000,
      label: "Weekend Peak",
    },
  ];

  it("calculates session wholly inside one rate band correctly", () => {
    // Monday (day 1) 12:00 to 13:00 IST (UTC: 06:30 to 07:30)
    // 2026-10-05 is a Monday
    const start = new Date("2026-10-05T06:30:00.000Z"); // 12:00 IST
    const end = new Date("2026-10-05T07:30:00.000Z");   // 13:00 IST

    const result = computeTimeCharge({
      start,
      end,
      bands: testBands,
      timezone: "Asia/Kolkata",
    });

    expect(result.billableMinutes).toBe(60);
    // 60 min @ 15000 paise/hr = 15000 paise (Rs 150)
    expect(result.totalPaise).toBe(15000);
    expect(result.breakdown.length).toBe(1);
    expect(result.breakdown[0].label).toBe("Day Rate");
  });

  it("correctly prorates across Day -> Happy Hour band boundary (16:30 to 17:30)", () => {
    // Monday 16:30 to 17:30 IST (UTC: 11:00 to 12:00)
    // 30 min Day (Rs 150/hr -> 7500 paise) + 30 min Happy Hour (Rs 100/hr -> 5000 paise) = 12500 paise (Rs 125)
    const start = new Date("2026-10-05T11:00:00.000Z"); // 16:30 IST
    const end = new Date("2026-10-05T12:00:00.000Z");   // 17:30 IST

    const result = computeTimeCharge({
      start,
      end,
      bands: testBands,
      timezone: "Asia/Kolkata",
    });

    expect(result.billableMinutes).toBe(60);
    expect(result.totalPaise).toBe(12500);
    expect(result.breakdown).toHaveLength(2);

    const dayItem = result.breakdown.find((b) => b.label === "Day Rate");
    const hhItem = result.breakdown.find((b) => b.label === "Happy Hour");

    expect(dayItem?.minutes).toBe(30);
    expect(dayItem?.amountPaise).toBe(7500);
    expect(hhItem?.minutes).toBe(30);
    expect(hhItem?.amountPaise).toBe(5000);
  });

  it("handles pause and resume intervals, excluding paused time from charges", () => {
    // Monday 12:00 to 13:00 IST (60 min total), paused for 20 minutes (12:15 to 12:35)
    // Billable = 40 minutes @ 15000 paise/hr = (40 * 250) = 10000 paise (Rs 100)
    const start = new Date("2026-10-05T06:30:00.000Z");
    const end = new Date("2026-10-05T07:30:00.000Z");
    const pauseStart = new Date("2026-10-05T06:45:00.000Z");
    const pauseEnd = new Date("2026-10-05T07:05:00.000Z");

    const result = computeTimeCharge({
      start,
      end,
      pauses: [{ pausedAt: pauseStart, resumedAt: pauseEnd }],
      bands: testBands,
      timezone: "Asia/Kolkata",
    });

    expect(result.billableMinutes).toBe(40);
    expect(result.pausedMinutes).toBe(20);
    expect(result.totalPaise).toBe(10000);
  });

  it("enforces minimum charge threshold (15 minutes min)", () => {
    // Monday 12:00 to 12:08 (8 minutes duration)
    // With 15 min minimum charge, customer is billed for 15 minutes
    const start = new Date("2026-10-05T06:30:00.000Z");
    const end = new Date("2026-10-05T06:38:00.000Z");

    const result = computeTimeCharge({
      start,
      end,
      rateCard: { minChargeMinutes: 15 },
      bands: testBands,
      timezone: "Asia/Kolkata",
    });

    expect(result.billableMinutes).toBe(15);
    // 15 min @ 150/hr = 3750 paise
    expect(result.totalPaise).toBe(3750);
  });

  it("waives overtime when session ends within grace minutes of allowance", () => {
    // 60 minutes booked allowance with 5 minutes grace
    // Session is 64 minutes (within 60 + 5 = 65)
    const start = new Date("2026-10-05T06:30:00.000Z");
    const end = new Date("2026-10-05T07:34:00.000Z"); // 64 minutes

    const result = computeTimeCharge({
      start,
      end,
      bookedMinutesAllowance: 60,
      rateCard: { graceMinutes: 5, overtimeMultiplier: 1.5 },
      bands: testBands,
      timezone: "Asia/Kolkata",
    });

    // Overtime multiplier should not have been penalized due to grace
    const otItems = result.breakdown.filter((b) => b.isOvertime);
    expect(otItems).toHaveLength(0);
  });
});

describe("Pricing Engine - Frames & Packages", () => {
  it("computes snooker frame charges correctly", () => {
    const charge = computeFrameCharge({
      framesPlayed: 3,
      framePricePaise: 12000, // Rs 120 per frame
    });
    expect(charge).toBe(36000); // Rs 360
  });

  it("computes package usage and overtime", () => {
    const usage = computePackageUsage({
      minutesUsedOrFrames: 330, // 5.5 hours used
      package: {
        billingMode: "TIME",
        quantity: 5, // 5 hours (300 minutes)
        pricePaise: 100000, // Rs 1000
      },
      overtimeRatePaisePerUnit: 25000, // Rs 250/hr overtime
    });

    expect(usage.includedUnitsUsed).toBe(300);
    expect(usage.remainingUnits).toBe(0);
    expect(usage.extraUnits).toBe(30); // 30 min overtime
    expect(usage.extraChargePaise).toBe(12500); // 30 * (25000 / 60) = Rs 125
    expect(usage.totalChargePaise).toBe(112500);
  });
});

describe("Pricing Engine - Membership & Taxes", () => {
  it("applies membership discount and deducts included minutes", () => {
    const res = applyMembership({
      subtotalPaise: 20000,
      tableChargePaise: 15000,
      sessionBillableMinutes: 60,
      membership: {
        discountPercent: 20.0,
        includedMinutes: 120,
        minutesUsed: 0,
        active: true,
      },
    });

    // 60 minutes are fully covered by included minutes
    expect(res.includedMinutesConsumed).toBe(60);
    expect(res.remainingMinutesAfterSession).toBe(60);
    expect(res.tableChargeAfterDiscountPaise).toBe(0);
  });

  it("computes itemized GST and total folio accurately", () => {
    const bill = computeBillTotals({
      tableChargePaise: 15000, // Rs 150
      tableTaxPercent: 5.0,
      orderItems: [
        { name: "Fries", unitPricePaise: 13000, quantity: 1, taxPercent: 5.0 },
        { name: "Coffee", unitPricePaise: 14000, quantity: 2, taxPercent: 5.0 },
      ],
      discountPaise: 0,
    });

    expect(bill.tableSubtotalPaise).toBe(15000);
    expect(bill.cafeSubtotalPaise).toBe(41000); // 13000 + 28000
    expect(bill.subtotalPaise).toBe(56000);
    expect(bill.tableTaxPaise).toBe(750); // 5% of 15000
    expect(bill.cafeTaxPaise).toBe(2050); // 5% of 41000
    expect(bill.totalTaxPaise).toBe(2800);
    expect(bill.totalPaise).toBe(58800); // 56000 + 2800
  });
});
