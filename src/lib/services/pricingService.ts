import { backendDataStore } from "./dataStore";
import { TableType } from "@/types/database";

export interface PriceCalculation {
  tableType: TableType;
  durationMinutes: number;
  ratePerHour: number;
  baseCharge: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  pricingLabel: string;
}

export function calculateAuthoritativePrice(
  tableId: string,
  startISO: string,
  endISO: string
): PriceCalculation {
  const table = backendDataStore.tables.find((t) => t.id === tableId);
  const tableType = table ? table.type : "pool";

  const start = new Date(startISO);
  const end = new Date(endISO);
  const durationMinutes = Math.max(30, Math.round((end.getTime() - start.getTime()) / (60 * 1000)));
  const durationHours = durationMinutes / 60;

  // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const day = start.getDay();
  const hour = start.getHours();
  const timeStr = `${hour.toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`;

  // Find matching pricing rule
  const matchedRule = backendDataStore.pricing.find((p) => {
    if (p.table_type !== tableType) return false;
    if (!p.days.includes(day)) return false;

    // Handle overnight window e.g. 17:00 to 01:00
    if (p.start_time <= p.end_time) {
      return timeStr >= p.start_time && timeStr < p.end_time;
    } else {
      // Crosses midnight
      return timeStr >= p.start_time || timeStr < p.end_time;
    }
  });

  const fallbackRate =
    tableType === "snooker"
      ? backendDataStore.settings.snooker_hourly_rate
      : backendDataStore.settings.pool_hourly_rate;

  const ratePerHour = matchedRule ? matchedRule.price_per_hour : fallbackRate;
  const pricingLabel = matchedRule ? matchedRule.label : `Standard ${tableType === "snooker" ? "Snooker" : "Pool"} Rate`;

  const baseCharge = Math.round(durationHours * ratePerHour);
  const taxPercentage = backendDataStore.settings.tax_percentage || 5;
  const taxAmount = Math.round((baseCharge * taxPercentage) / 100);
  const totalAmount = baseCharge + taxAmount;

  return {
    tableType,
    durationMinutes,
    ratePerHour,
    baseCharge,
    taxPercentage,
    taxAmount,
    totalAmount,
    pricingLabel,
  };
}

export function updatePricingRule(
  id: string,
  updates: Partial<{ label: string; price_per_hour: number; start_time: string; end_time: string; days: number[] }>
) {
  const rule = backendDataStore.pricing.find((p) => p.id === id);
  if (!rule) throw new Error("Pricing rule not found");

  Object.assign(rule, updates);
  return rule;
}
