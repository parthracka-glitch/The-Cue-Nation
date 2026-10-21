import { describe, it, expect } from "vitest";
import { calculateBill, getBillBreakdown } from "./calculate";

describe("calculateBill", () => {
  it("charges base slot at hourly rate", () => {
    expect(calculateBill({ minutes: 60, rate: 300 })).toBe(300);
    expect(calculateBill({ minutes: 120, rate: 450 })).toBe(900);
  });

  it("prorates extra minutes correctly", () => {
    expect(calculateBill({ minutes: 60, extra: 30, rate: 300 })).toBe(450);
    expect(calculateBill({ minutes: 60, extra: 15, rate: 400 })).toBe(500);
  });

  it("adds served food items only", () => {
    const total = calculateBill({
      minutes: 60,
      rate: 300,
      food: [
        { price: 180, qty: 2, status: "served" }, // 360
        { price: 250, qty: 1, status: "cancelled" }, // ignored
        { price: 150, qty: 1, status: "preparing" }, // unserved not billed until served
      ],
    });
    expect(total).toBe(660); // 300 + 360
  });

  it("never returns negative or NaN values", () => {
    expect(Number.isFinite(calculateBill({ minutes: 0, rate: 0 }))).toBe(true);
    expect(calculateBill({ minutes: -30, rate: -500 })).toBe(0);
  });

  it("rounds to 2 decimals accurately", () => {
    expect(calculateBill({ minutes: 7, rate: 333 })).toBe(38.85);
  });

  it("provides detailed breakdown", () => {
    const breakdown = getBillBreakdown({
      minutes: 60,
      extra: 15,
      rate: 400,
      food: [{ price: 100, qty: 1, status: "served" }],
    });

    expect(breakdown.baseTimeCharge).toBe(400);
    expect(breakdown.extraTimeCharge).toBe(100);
    expect(breakdown.totalTimeCharge).toBe(500);
    expect(breakdown.foodCharge).toBe(100);
    expect(breakdown.total).toBe(600);
  });
});
