export type UserRole = "customer" | "staff" | "owner";
export type TableType = "pool" | "snooker";
export type TableStatus = "free" | "booked" | "running" | "maintenance";
export type BookingStatus = "pending" | "confirmed" | "checked_in" | "completed" | "cancelled" | "expired" | "no_show";
export type BookingSource = "online" | "offline";
export type OrderStatus = "new" | "preparing" | "ready" | "served" | "cancelled";
export type PayMode = "cash" | "upi" | "card";

export interface PoolOperatingHours {
  id: string;
  pool_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  opening_time: string; // e.g. "10:00"
  closing_time: string; // e.g. "01:00"
  is_closed: boolean;
}

export interface PoolClosure {
  id: string;
  pool_id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  created_at: string;
}

export interface TemporaryReservation {
  id: string;
  pool_id: string;
  customer_id?: string;
  start_datetime: string;
  end_datetime: string;
  expires_at: string;
  status: "active" | "expired" | "converted";
}

export interface Pool {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image_url: string;
  type: TableType;
  category: "main" | "smoker";
  opening_time: string; // e.g. "10:00"
  closing_time: string; // e.g. "01:00"
  booking_duration_options: number[]; // [60, 90, 120] in minutes
  hourly_rate: number;
  is_active: boolean;
  status: TableStatus;
  operating_hours?: PoolOperatingHours[];
  closures?: PoolClosure[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  created_at: string;
}

export interface GameTable {
  id: string;
  name: string;
  type: TableType;
  status: TableStatus;
  qr_secret: string;
  active: boolean;
  category?: "main" | "smoker";
  opening_time?: string;
  closing_time?: string;
  hourly_rate?: number;
}

export interface Pricing {
  id: string;
  table_type: TableType;
  label: string;
  days: number[];
  start_time: string;
  end_time: string;
  price_per_hour: number;
}

export interface Booking {
  id: string;
  booking_code: string;
  user_id?: string | null;
  guest_name?: string | null;
  guest_phone?: string | null;
  guest_email?: string | null;
  table_id: string;
  pool_id?: string;
  during: string; // tstzrange string, e.g. ["2026-10-20T14:00:00Z","2026-10-20T16:00:00Z")
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  status: BookingStatus;
  source: BookingSource;
  pin_hash: string;
  pin_attempts: number;
  amount: number;
  created_at: string;
  table?: GameTable;
  pool?: Pool;
}

export interface BookedSlot {
  booking_id: string;
  table_id: string;
  during: string;
}

export interface Session {
  id: string;
  booking_id: string;
  table_id: string;
  started_at: string;
  ended_at?: string | null;
  extra_minutes: number;
  time_charge: number;
  booking?: Booking;
  table?: GameTable;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  image_url?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  qty: number;
  price: number;
  menu_item?: MenuItem;
}

export interface Order {
  id: string;
  session_id: string;
  table_id: string;
  status: OrderStatus;
  created_at: string;
  menu_item_id?: string;
  items?: OrderItem[];
  table?: GameTable;
}

export interface Bill {
  id: string;
  bill_number?: string;
  session_id: string;
  time_charge: number;
  food_charge: number;
  discount_amount?: number;
  tax_amount?: number;
  total: number;
  amount_paid?: number;
  balance_due?: number;
  paid: boolean;
  pay_mode?: PayMode | null;
  paid_at?: string | null;
  created_at?: string;
  session?: Session;
  booking?: Booking;
  table?: GameTable;
  staff_id?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  spent_on: string;
  note?: string | null;
  created_by?: string | null;
}

export interface SiteContent {
  key: string;
  value: Record<string, unknown>;
  updated_by?: string | null;
  updated_at: string;
}

export interface StaffAccount {
  id: string;
  staff_id: string; // e.g. "STAFF-01"
  name: string;
  email: string;
  phone: string;
  role: "staff" | "manager";
  active: boolean;
  password_hash: string;
  created_at: string;
  last_login_at?: string | null;
}

export interface AdminAccount {
  id: string;
  admin_id: string; // e.g. "ADMIN-01"
  name: string;
  email: string;
  role: "owner" | "admin";
  active: boolean;
  password_hash: string;
  created_at: string;
  last_login_at?: string | null;
}

export interface PaymentRecord {
  id: string;
  booking_id?: string | null;
  bill_id?: string | null;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "completed" | "failed" | "refunded";
  method: "online" | "cash" | "upi" | "card";
  reference?: string | null;
  payment_intent_id?: string | null;
  provider_ref?: string | null;
  recorded_by?: string | null; // Staff ID if pay-at-venue
  created_at: string;
  updated_at?: string;
}

export interface MaintenanceRecord {
  id: string;
  table_id: string;
  table_name: string;
  issue: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved";
  reported_by: string;
  reported_at: string;
  resolved_at?: string | null;
  notes?: string | null;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
}

export interface VenueSettings {
  venue_name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  opening_time: string; // e.g. "10:00"
  closing_time: string; // e.g. "01:00"
  max_booking_days_ahead: number;
  slot_duration_minutes: number;
  cancellation_deadline_hours: number;
  tax_percentage: number;
  pool_hourly_rate: number;
  snooker_hourly_rate: number;
}

