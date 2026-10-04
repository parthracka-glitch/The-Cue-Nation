export type Role = "ADMIN" | "STAFF" | "KITCHEN" | "CUSTOMER";

export type TableType = "POOL" | "SNOOKER" | "CAROM";

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";

export type BillingMode = "TIME" | "FRAME" | "PACKAGE";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type SessionStatus = "RUNNING" | "PAUSED" | "ENDED";

export type Station = "KITCHEN" | "BAR";

export type OrderType = "DINE_IN_TABLE" | "TAKEAWAY";

export type OrderStatus =
  | "OPEN"
  | "SENT"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "CANCELLED";

export type KotStatus = "NEW" | "PREPARING" | "READY" | "SERVED";

export type BillStatus = "OPEN" | "PAID" | "PARTIAL" | "CREDIT";

export type SplitMode = "NONE" | "EVEN" | "BY_ITEM" | "LOSER_PAYS";

export type PaymentMethod = "CASH" | "UPI" | "CARD" | "WALLET" | "CREDIT";

export type LedgerEntryType =
  | "CREDIT_GIVEN"
  | "CREDIT_REPAID"
  | "WALLET_TOPUP"
  | "WALLET_SPEND"
  | "LOYALTY_EARNED"
  | "LOYALTY_REDEEMED";

export interface RateBandData {
  id?: string;
  daysOfWeek: string; // e.g. "1,2,3,4,5"
  startMinute: number; // 0 - 1439
  endMinute: number; // 1 - 1440
  ratePerHourPaise: number;
  label: string;
}

export interface RateCardSnapshot {
  id: string;
  name: string;
  billingMode: BillingMode;
  framePricePaise?: number | null;
  graceMinutes: number;
  minChargeMinutes: number;
  overtimeMultiplier: number;
  bands: RateBandData[];
}
