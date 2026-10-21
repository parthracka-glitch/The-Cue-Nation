export interface FoodItemOrder {
  price: number;
  qty: number;
  status: "new" | "preparing" | "served" | "cancelled";
}

export interface BillCalculationInput {
  minutes: number;
  rate: number; // hourly rate
  extra?: number; // extra minutes added
  food?: FoodItemOrder[];
}

export interface BillBreakdown {
  baseTimeCharge: number;
  extraTimeCharge: number;
  totalTimeCharge: number;
  foodCharge: number;
  total: number;
}

export function calculateBill(input: BillCalculationInput): number {
  const breakdown = getBillBreakdown(input);
  return breakdown.total;
}

export function getBillBreakdown(input: BillCalculationInput): BillBreakdown {
  const minutes = Math.max(0, input.minutes || 0);
  const extra = Math.max(0, input.extra || 0);
  const rate = Math.max(0, input.rate || 0);

  const baseHours = minutes / 60;
  const baseTimeCharge = Math.round(baseHours * rate * 100) / 100;

  const extraHours = extra / 60;
  const extraTimeCharge = Math.round(extraHours * rate * 100) / 100;

  const totalTimeCharge = Math.round((baseTimeCharge + extraTimeCharge) * 100) / 100;

  let foodCharge = 0;
  if (input.food && Array.isArray(input.food)) {
    for (const item of input.food) {
      if (item.status === "served") {
        foodCharge += (item.price || 0) * (item.qty || 0);
      }
    }
  }
  foodCharge = Math.round(foodCharge * 100) / 100;

  const total = Math.round((totalTimeCharge + foodCharge) * 100) / 100;

  return {
    baseTimeCharge,
    extraTimeCharge,
    totalTimeCharge,
    foodCharge,
    total: isNaN(total) ? 0 : total,
  };
}
