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
  membership_enabled?: boolean;
}

export interface WaitingListEntry {
  id: string;
  customer_name: string;
  customer_phone: string;
  discipline: "pool" | "snooker";
  party_size: number;
  preferred_duration: number; // minutes
  created_at: string;
  status: "waiting" | "notified" | "seated" | "cancelled" | "expired";
  estimated_wait_minutes?: number;
  allocated_table_id?: string;
  notes?: string;
}

export interface ShiftHandover {
  id: string;
  shift_date: string;
  outgoing_staff_id: string;
  outgoing_staff_name: string;
  incoming_staff_id?: string;
  incoming_staff_name?: string;
  cash_drawer_expected: number;
  cash_drawer_actual: number;
  cash_variance: number;
  completed_sessions_count: number;
  unpaid_bills_count: number;
  operational_notes: string;
  status: "submitted" | "acknowledged";
  created_at: string;
  acknowledged_at?: string;
}

export interface DailyClosing {
  id: string;
  closing_date: string;
  closed_by_id: string;
  closed_by_name: string;
  total_sessions: number;
  total_revenue: number;
  cash_collected: number;
  upi_collected: number;
  card_collected: number;
  online_collected: number;
  refunds_total: number;
  discounts_total: number;
  outstanding_balance: number;
  expected_cash: number;
  actual_cash: number;
  cash_variance: number;
  closing_notes?: string;
  status: "submitted" | "approved" | "discrepancy";
  created_at: string;
  approved_by?: string;
  approved_at?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tier: "Silver" | "Gold" | "Platinum";
  fee: number;
  duration_days: number;
  discount_percentage: number;
  points_multiplier: number;
  perks: string[];
  active: boolean;
}

export interface CustomerMembership {
  id: string;
  customer_phone: string;
  customer_name: string;
  plan_id: string;
  plan_name: string;
  tier: "Silver" | "Gold" | "Platinum";
  start_date: string;
  expiry_date: string;
  points_balance: number;
  active: boolean;
  created_at: string;
}

export interface RewardLedgerEntry {
  id: string;
  customer_phone: string;
  points: number;
  type: "earned" | "redeemed" | "adjustment";
  reference_id?: string;
  note?: string;
  created_at: string;
}

export interface NotificationRecord {
  id: string;
  recipient_phone: string;
  recipient_name: string;
  type: "booking_confirmation" | "reminder" | "bill_ready" | "waitlist_ready" | "promotional";
  message: string;
  status: "queued" | "sent" | "delivered" | "failed";
  channel: "whatsapp" | "sms";
  created_at: string;
  sent_at?: string;
  error_message?: string;
}


