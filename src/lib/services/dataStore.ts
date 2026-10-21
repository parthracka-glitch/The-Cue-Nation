import {
  GameTable,
  Booking,
  Session,
  Order,
  Bill,
  MenuItem,
  Expense,
  Pricing,
  StaffAccount,
  AdminAccount,
  PaymentRecord,
  MaintenanceRecord,
  AuditLog,
  VenueSettings,
  Pool,
  PoolOperatingHours,
  PoolClosure,
  TemporaryReservation,
  Customer,
} from "@/types/database";
import { hashPassword, hashPin } from "./crypto";

const DEFAULT_SETTINGS: VenueSettings = {
  venue_name: "Cue Nation Parlour & Lounge",
  tagline: "Own the Table",
  address: "80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
  phone: "+91 80 4123 4567",
  email: "concierge@cuenation.club",
  opening_time: "10:00",
  closing_time: "01:00",
  max_booking_days_ahead: 7,
  slot_duration_minutes: 60,
  cancellation_deadline_hours: 2,
  tax_percentage: 5,
  pool_hourly_rate: 350,
  snooker_hourly_rate: 500,
};

export const INITIAL_POOLS: Pool[] = [
  {
    id: "main-pool",
    name: "Main Pool",
    tagline: "Championship Tournament Pool Arena",
    description:
      "Tournament-grade 9ft English Championship Pool arena with authentic Strachan 6811 cloth, laser-leveled 3-piece Brazilian slate, Northern rubber cushions, and brass overhead lamp illumination.",
    image_url: "/images/venue-background.jpg",
    type: "pool",
    category: "main",
    opening_time: "10:00",
    closing_time: "01:00",
    booking_duration_options: [60, 90, 120],
    hourly_rate: 350,
    is_active: true,
    status: "free",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "smoker-pool",
    name: "Smoker Pool",
    tagline: "Private Smoking & Cigar Lounge Pool",
    description:
      "Dedicated climate-controlled smoking & cigar parlour pool arena featuring medical-grade air purification, plush button-tufted Chesterfield leather seating, and table-side cocktail service.",
    image_url:
      "https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=1200&q=80",
    type: "pool",
    category: "smoker",
    opening_time: "11:00",
    closing_time: "02:00",
    booking_duration_options: [60, 90, 120],
    hourly_rate: 400,
    is_active: true,
    status: "free",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_TABLES: GameTable[] = [
  {
    id: "pool-1",
    name: "Pool Table 1",
    type: "pool",
    status: "free",
    qr_secret: "secret-pool-1",
    active: true,
    hourly_rate: 300,
  },
  {
    id: "pool-2",
    name: "Pool Table 2",
    type: "pool",
    status: "free",
    qr_secret: "secret-pool-2",
    active: true,
    hourly_rate: 300,
  },
  {
    id: "pool-3",
    name: "Pool Table 3",
    type: "pool",
    status: "free",
    qr_secret: "secret-pool-3",
    active: true,
    hourly_rate: 300,
  },
  {
    id: "snooker-1",
    name: "Snooker Table 1",
    type: "snooker",
    status: "free",
    qr_secret: "secret-snooker-1",
    active: true,
    hourly_rate: 450,
  },
  {
    id: "snooker-2",
    name: "Snooker Table 2",
    type: "snooker",
    status: "free",
    qr_secret: "secret-snooker-2",
    active: true,
    hourly_rate: 450,
  },
  {
    id: "snooker-3",
    name: "Snooker Table 3",
    type: "snooker",
    status: "free",
    qr_secret: "secret-snooker-3",
    active: true,
    hourly_rate: 450,
  },
  // Legacy & Test compatibility aliases
  {
    id: "table-1",
    name: "Pool Table 1 (Brunswick)",
    type: "pool",
    status: "free",
    qr_secret: "secret-table-1",
    active: true,
    hourly_rate: 300,
  },
  {
    id: "table-2",
    name: "Pool Table 2 (Rasson)",
    type: "pool",
    status: "free",
    qr_secret: "secret-table-2",
    active: true,
    hourly_rate: 300,
  },
  {
    id: "table-5",
    name: "Snooker Table 1 (Riley)",
    type: "snooker",
    status: "free",
    qr_secret: "secret-table-5",
    active: true,
    hourly_rate: 450,
  },
  {
    id: "main-pool",
    name: "Main Pool — Tournament Arena",
    type: "pool",
    status: "free",
    qr_secret: "secret-main-pool",
    active: true,
    category: "main",
    opening_time: "10:00",
    closing_time: "01:00",
    hourly_rate: 350,
  },
  {
    id: "smoker-pool",
    name: "Smoker Pool — Smoking Lounge",
    type: "pool",
    status: "free",
    qr_secret: "secret-smoker-pool",
    active: true,
    category: "smoker",
    opening_time: "11:00",
    closing_time: "02:00",
    hourly_rate: 400,
  },
];

const INITIAL_PRICING: Pricing[] = [
  {
    id: "pr-1",
    table_type: "pool",
    label: "Weekday Daytime (10:00 - 17:00)",
    days: [1, 2, 3, 4, 5],
    start_time: "10:00",
    end_time: "17:00",
    price_per_hour: 300,
  },
  {
    id: "pr-2",
    table_type: "pool",
    label: "Weekday Prime (17:00 - 01:00)",
    days: [1, 2, 3, 4, 5],
    start_time: "17:00",
    end_time: "01:00",
    price_per_hour: 350,
  },
  {
    id: "pr-3",
    table_type: "pool",
    label: "Weekend All-Day",
    days: [0, 6],
    start_time: "10:00",
    end_time: "01:00",
    price_per_hour: 400,
  },
  {
    id: "pr-4",
    table_type: "snooker",
    label: "Weekday Standard",
    days: [1, 2, 3, 4, 5],
    start_time: "10:00",
    end_time: "01:00",
    price_per_hour: 500,
  },
  {
    id: "pr-5",
    table_type: "snooker",
    label: "Weekend Tournament Prime",
    days: [0, 6],
    start_time: "10:00",
    end_time: "01:00",
    price_per_hour: 600,
  },
];

const INITIAL_MENU: MenuItem[] = [
  {
    id: "m-1",
    name: "Signature Baize Cold Brew",
    category: "Coffee",
    price: 180,
    available: true,
    image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-2",
    name: "Smoked Bronze Espresso Macchiato",
    category: "Coffee",
    price: 150,
    available: true,
    image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-3",
    name: "Artisanal Flat White",
    category: "Coffee",
    price: 190,
    available: true,
    image_url: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-4",
    name: "Truffle Parmesan Hand-cut Fries",
    category: "Snacks",
    price: 240,
    available: true,
    image_url: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-5",
    name: "Smoked Chicken & Sourdough Club",
    category: "Mains",
    price: 320,
    available: true,
    image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-6",
    name: "Charred Paneer Pesto Brioche",
    category: "Mains",
    price: 290,
    available: true,
    image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
  },
];

class BackendDataStore {
  pools: Pool[] = [...INITIAL_POOLS];
  tables: GameTable[] = [...INITIAL_TABLES];
  pricing: Pricing[] = [...INITIAL_PRICING];
  menu: MenuItem[] = [...INITIAL_MENU];
  bookings: Booking[] = [];
  sessions: Session[] = [];
  orders: Order[] = [];
  bills: Bill[] = [];
  expenses: Expense[] = [];
  staffAccounts: StaffAccount[] = [];
  adminAccounts: AdminAccount[] = [];
  payments: PaymentRecord[] = [];
  maintenanceRecords: MaintenanceRecord[] = [];
  auditLogs: AuditLog[] = [];
  poolOperatingHours: PoolOperatingHours[] = [];
  poolClosures: PoolClosure[] = [];
  temporaryReservations: TemporaryReservation[] = [];
  customers: Customer[] = [];
  settings: VenueSettings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Initial Admin Account
    this.adminAccounts.push({
      id: "admin-1",
      admin_id: "ADM-001",
      name: "Parth Racka",
      email: "admin@cuenation.club",
      role: "owner",
      active: true,
      password_hash: hashPassword("AdminPassword123!"),
      created_at: new Date().toISOString(),
    });

    // Initial Staff Accounts
    this.staffAccounts.push(
      {
        id: "staff-1",
        staff_id: "STF-101",
        name: "Kavya Sharma",
        email: "kavya@cuenation.club",
        phone: "+91 98765 43210",
        role: "manager",
        active: true,
        password_hash: hashPassword("StaffPassword123!"),
        created_at: new Date().toISOString(),
      },
      {
        id: "staff-2",
        staff_id: "STF-102",
        name: "Rohan Verma",
        email: "rohan@cuenation.club",
        phone: "+91 98765 43211",
        role: "staff",
        active: true,
        password_hash: hashPassword("StaffPassword123!"),
        created_at: new Date().toISOString(),
      }
    );

    // Initial Active Session for demo
    const now = new Date();
    const startTime = new Date(now.getTime() - 25 * 60 * 1000).toISOString();
    const demoBookingId = "bk-demo-1";
    this.bookings.push({
      id: demoBookingId,
      booking_code: "CN-DEMO01",
      table_id: "table-3",
      guest_name: "Vikram Malhotra",
      guest_phone: "+91 98450 11223",
      during: `["${startTime}","${new Date(now.getTime() + 35 * 60 * 1000).toISOString()}"]`,
      status: "checked_in",
      source: "online",
      pin_hash: hashPin("441199"),
      pin_attempts: 0,
      amount: 350,
      created_at: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
    });

    this.sessions.push({
      id: "sess-demo-1",
      booking_id: demoBookingId,
      table_id: "table-3",
      started_at: startTime,
      ended_at: null,
      extra_minutes: 0,
      time_charge: 350,
    });

    // Initial maintenance log for demonstration
    this.maintenanceRecords.push({
      id: "maint-1",
      table_id: "table-4",
      table_name: "Table 4 — Dynamic III Pool",
      issue: "Routine baize iron and level recalibration",
      severity: "low",
      status: "resolved",
      reported_by: "Kavya Sharma (STF-101)",
      reported_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      notes: "Cloth cleaned, nap brushed, rails tightened.",
    });

    // Initial audit log
    this.auditLogs.push({
      id: "audit-init",
      timestamp: new Date().toISOString(),
      actor_id: "SYS",
      actor_name: "Cue Nation Engine",
      actor_role: "system",
      action: "SYSTEM_INITIALIZED",
      resource_type: "system",
      resource_id: "init",
      details: { version: "1.0.0", message: "Parlour backend data store initialized" },
    });

    // Guarantee collections on instance
    if (!this.pools) this.pools = [...INITIAL_POOLS];
    if (!this.poolOperatingHours) this.poolOperatingHours = [];
    if (!this.poolClosures) this.poolClosures = [];
    if (!this.temporaryReservations) this.temporaryReservations = [];
    if (!this.customers) this.customers = [];
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __backendDataStore: BackendDataStore | undefined;
}

export const backendDataStore: BackendDataStore =
  globalThis.__backendDataStore || new BackendDataStore();

// Guarantee properties on existing global instance if reloaded
if (!backendDataStore.pools || backendDataStore.pools.length === 0) {
  backendDataStore.pools = [...INITIAL_POOLS];
}
if (!backendDataStore.poolOperatingHours) {
  backendDataStore.poolOperatingHours = [];
}
if (!backendDataStore.poolClosures) {
  backendDataStore.poolClosures = [];
}
if (!backendDataStore.temporaryReservations) {
  backendDataStore.temporaryReservations = [];
}
if (!backendDataStore.customers) {
  backendDataStore.customers = [];
}
if (!backendDataStore.tables || !backendDataStore.tables.some((t) => t.id === "main-pool")) {
  backendDataStore.tables = [...INITIAL_TABLES];
}

if (process.env.NODE_ENV !== "production") {
  globalThis.__backendDataStore = backendDataStore;
}

