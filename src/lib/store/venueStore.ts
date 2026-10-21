"use client";

import {
  GameTable,
  Booking,
  Session,
  Order,
  Bill,
  MenuItem,
  Expense,
  TableStatus,
  OrderStatus,
  WaitingListEntry,
  ShiftHandover,
  DailyClosing,
  MembershipPlan,
  CustomerMembership,
  RewardLedgerEntry,
  MaintenanceRecord,
} from "@/types/database";

const INITIAL_TABLES: GameTable[] = [
  {
    id: "pool-1",
    name: "Pool Table 1",
    type: "pool",
    status: "free",
    qr_secret: "secret-pool-1",
    active: true,
    category: "main",
    opening_time: "10:00",
    closing_time: "02:00",
    hourly_rate: 300,
  },
  {
    id: "pool-2",
    name: "Pool Table 2",
    type: "pool",
    status: "free",
    qr_secret: "secret-pool-2",
    active: true,
    category: "main",
    opening_time: "10:00",
    closing_time: "02:00",
    hourly_rate: 300,
  },
  {
    id: "pool-3",
    name: "Pool Table 3",
    type: "pool",
    status: "free",
    qr_secret: "secret-pool-3",
    active: true,
    category: "main",
    opening_time: "10:00",
    closing_time: "02:00",
    hourly_rate: 300,
  },
  {
    id: "snooker-1",
    name: "Snooker Table 1",
    type: "snooker",
    status: "free",
    qr_secret: "secret-snooker-1",
    active: true,
    category: "main",
    opening_time: "10:00",
    closing_time: "02:00",
    hourly_rate: 450,
  },
  {
    id: "snooker-2",
    name: "Snooker Table 2",
    type: "snooker",
    status: "free",
    qr_secret: "secret-snooker-2",
    active: true,
    category: "main",
    opening_time: "10:00",
    closing_time: "02:00",
    hourly_rate: 450,
  },
  {
    id: "snooker-3",
    name: "Snooker Table 3",
    type: "snooker",
    status: "free",
    qr_secret: "secret-snooker-3",
    active: true,
    category: "main",
    opening_time: "10:00",
    closing_time: "02:00",
    hourly_rate: 450,
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
  {
    id: "m-7",
    name: "Midnight Cascara Sparkler",
    category: "Beverages",
    price: 190,
    available: true,
    image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "m-8",
    name: "Dark Chocolate Sea Salt Brownie",
    category: "Desserts",
    price: 220,
    available: true,
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
  },
];

// Active mock running session for Table 3
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b-101",
    booking_code: "CN-7K3F9Q",
    user_id: "user-1",
    guest_name: "Aakash Mehta",
    guest_phone: "+919876543210",
    table_id: "table-3",
    during: `[${new Date(Date.now() - 35 * 60 * 1000).toISOString()},${new Date(Date.now() + 25 * 60 * 1000).toISOString()})`,
    status: "checked_in",
    source: "online",
    pin_hash: "123456",
    pin_attempts: 0,
    amount: 400,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "b-102",
    booking_code: "CN-8M4N2P",
    user_id: null,
    guest_name: "Rohan Verma",
    guest_phone: "+919812345678",
    table_id: "table-1",
    during: `[${new Date(Date.now() + 2 * 3600 * 1000).toISOString()},${new Date(Date.now() + 3 * 3600 * 1000).toISOString()})`,
    status: "confirmed",
    source: "online",
    pin_hash: "456789",
    pin_attempts: 0,
    amount: 300,
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_SESSIONS: Session[] = [
  {
    id: "sess-101",
    booking_id: "b-101",
    table_id: "table-3",
    started_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    ended_at: null,
    extra_minutes: 0,
    time_charge: 400,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1",
    session_id: "sess-101",
    table_id: "table-3",
    status: "preparing",
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    items: [
      {
        id: "oi-1",
        order_id: "ord-1",
        menu_item_id: "m-1",
        qty: 2,
        price: 180,
        menu_item: INITIAL_MENU[0],
      },
      {
        id: "oi-2",
        order_id: "ord-1",
        menu_item_id: "m-4",
        qty: 1,
        price: 240,
        menu_item: INITIAL_MENU[3],
      },
    ],
  },
];

const INITIAL_BILLS: Bill[] = [
  {
    id: "bill-99",
    session_id: "past-sess-99",
    time_charge: 600,
    food_charge: 440,
    total: 1040,
    paid: true,
    pay_mode: "upi",
    paid_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    category: "Table Maintenance",
    amount: 4500,
    spent_on: "2026-10-18",
    note: "Strachan 6811 cloth brushing and iron re-leveling",
  },
  {
    id: "exp-2",
    category: "Café Inventory",
    amount: 12400,
    spent_on: "2026-10-19",
    note: "Specialty Arabica beans restock (Blue Tokai Estate)",
  },
  {
    id: "exp-3",
    category: "Utilities & Power",
    amount: 8200,
    spent_on: "2026-10-15",
    note: "High-power table overhead luminaire bulb replacements",
  },
];

class VenueStore {
  private tables: GameTable[] = [...INITIAL_TABLES];
  private bookings: Booking[] = [...INITIAL_BOOKINGS];
  private sessions: Session[] = [...INITIAL_SESSIONS];
  private orders: Order[] = [...INITIAL_ORDERS];
  private bills: Bill[] = [...INITIAL_BILLS];
  private expenses: Expense[] = [...INITIAL_EXPENSES];
  private menu: MenuItem[] = [...INITIAL_MENU];
  private waitingList: WaitingListEntry[] = [];
  private shiftHandovers: ShiftHandover[] = [];
  private dailyClosings: DailyClosing[] = [];
  private membershipPlans: MembershipPlan[] = [
    {
      id: "plan-silver",
      name: "Silver Cueist",
      tier: "Silver",
      fee: 1499,
      duration_days: 30,
      discount_percentage: 10,
      points_multiplier: 1,
      perks: ["10% off table time", "Priority booking (3 days)", "1 Reward Point per ₹10"],
      active: true,
    },
    {
      id: "plan-gold",
      name: "Gold Champion",
      tier: "Gold",
      fee: 3499,
      duration_days: 90,
      discount_percentage: 15,
      points_multiplier: 1.5,
      perks: ["15% off table time & café", "Complimentary locker", "Priority booking (7 days)", "1.5x Reward Points"],
      active: true,
    },
    {
      id: "plan-platinum",
      name: "Platinum Master",
      tier: "Platinum",
      fee: 9999,
      duration_days: 365,
      discount_percentage: 20,
      points_multiplier: 2,
      perks: ["20% off all charges", "VIP lounge access", "Complimentary cue storage", "2x Reward Points"],
      active: true,
    },
  ];
  private customerMemberships: CustomerMembership[] = [];
  private rewardLedger: RewardLedgerEntry[] = [];
  private maintenanceRecords: MaintenanceRecord[] = [];
  private isTabletMode: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("cn_tables", JSON.stringify(this.tables));
      localStorage.setItem("cn_bookings", JSON.stringify(this.bookings));
      localStorage.setItem("cn_sessions", JSON.stringify(this.sessions));
      localStorage.setItem("cn_orders", JSON.stringify(this.orders));
      localStorage.setItem("cn_bills", JSON.stringify(this.bills));
      localStorage.setItem("cn_expenses", JSON.stringify(this.expenses));
      localStorage.setItem("cn_menu", JSON.stringify(this.menu));
      localStorage.setItem("cn_waiting_list", JSON.stringify(this.waitingList));
      localStorage.setItem("cn_shift_handovers", JSON.stringify(this.shiftHandovers));
      localStorage.setItem("cn_daily_closings", JSON.stringify(this.dailyClosings));
      localStorage.setItem("cn_customer_memberships", JSON.stringify(this.customerMemberships));
      localStorage.setItem("cn_reward_ledger", JSON.stringify(this.rewardLedger));
      localStorage.setItem("cn_maintenance", JSON.stringify(this.maintenanceRecords));
      localStorage.setItem("cn_tablet_mode", JSON.stringify(this.isTabletMode));
    } catch {
      // ignore storage errors
    }
    this.notify();
  }

  private loadFromStorage() {
    try {
      const CURRENT_STORE_VERSION = "v5_qnation_master";
      const ver = localStorage.getItem("cn_store_ver");
      const t = localStorage.getItem("cn_tables");

      // Auto-migrate if version is old or tables missing standard pool-1/snooker-1 IDs
      if (ver !== CURRENT_STORE_VERSION || !t || !t.includes("pool-1") || !t.includes("snooker-1")) {
        this.tables = [...INITIAL_TABLES];
        localStorage.setItem("cn_tables", JSON.stringify(this.tables));
        localStorage.setItem("cn_store_ver", CURRENT_STORE_VERSION);
      } else {
        this.tables = JSON.parse(t);
      }

      const b = localStorage.getItem("cn_bookings");
      const s = localStorage.getItem("cn_sessions");
      const o = localStorage.getItem("cn_orders");
      const bi = localStorage.getItem("cn_bills");
      const e = localStorage.getItem("cn_expenses");
      const m = localStorage.getItem("cn_menu");
      const wl = localStorage.getItem("cn_waiting_list");
      const sh = localStorage.getItem("cn_shift_handovers");
      const dc = localStorage.getItem("cn_daily_closings");
      const cm = localStorage.getItem("cn_customer_memberships");
      const rl = localStorage.getItem("cn_reward_ledger");
      const mt = localStorage.getItem("cn_maintenance");
      const tm = localStorage.getItem("cn_tablet_mode");

      if (b) this.bookings = JSON.parse(b);
      if (s) this.sessions = JSON.parse(s);
      if (o) this.orders = JSON.parse(o);
      if (bi) this.bills = JSON.parse(bi);
      if (e) this.expenses = JSON.parse(e);
      if (m) this.menu = JSON.parse(m);
      if (wl) this.waitingList = JSON.parse(wl);
      if (sh) this.shiftHandovers = JSON.parse(sh);
      if (dc) this.dailyClosings = JSON.parse(dc);
      if (cm) this.customerMemberships = JSON.parse(cm);
      if (rl) this.rewardLedger = JSON.parse(rl);
      if (mt) this.maintenanceRecords = JSON.parse(mt);
      if (tm) this.isTabletMode = JSON.parse(tm);
    } catch {
      // fallback to initial
      this.tables = [...INITIAL_TABLES];
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- GETTERS ---
  getTables() {
    return [...this.tables];
  }

  getTable(id: string) {
    return this.tables.find((t) => t.id === id);
  }

  getBookings() {
    return [...this.bookings];
  }

  getSessions() {
    return [...this.sessions];
  }

  getRunningSessionForTable(tableId: string) {
    return this.sessions.find((s) => s.table_id === tableId && !s.ended_at);
  }

  getOrders() {
    return [...this.orders];
  }

  getOrdersForTable(tableId: string) {
    return this.orders.filter((o) => o.table_id === tableId);
  }

  getBills() {
    return [...this.bills];
  }

  getExpenses() {
    return [...this.expenses];
  }

  getMenu() {
    return [...this.menu];
  }

  setBookings(bookings: Booking[]) {
    this.bookings = [...bookings];
    this.saveToStorage();
  }

  setSessions(sessions: Session[]) {
    this.sessions = [...sessions];
    this.saveToStorage();
  }

  // --- ACTIONS ---

  createBooking(params: {
    tableId: string;
    startISO: string;
    endISO: string;
    guestName?: string;
    guestPhone?: string;
    source?: "online" | "offline";
    amount: number;
    userId?: string | null;
  }): { booking: Booking; pin: string } {
    // Generate 6-digit random PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const code = "CN-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newBooking: Booking = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      booking_code: code,
      user_id: params.userId || null,
      guest_name: params.guestName || "Guest",
      guest_phone: params.guestPhone || "",
      table_id: params.tableId,
      during: `[${params.startISO},${params.endISO})`,
      status: "confirmed",
      source: params.source || "online",
      pin_hash: pin, // In local store stored as plaintext for verification
      pin_attempts: 0,
      amount: params.amount,
      created_at: new Date().toISOString(),
    };

    this.bookings.push(newBooking);

    // If booking starts right now and is walk-in offline, update table status
    const startMs = new Date(params.startISO).getTime();
    if (Math.abs(startMs - Date.now()) < 15 * 60 * 1000) {
      const table = this.tables.find((t) => t.id === params.tableId);
      if (table && table.status === "free") {
        table.status = "booked";
      }
    }

    this.saveToStorage();
    return { booking: newBooking, pin };
  }

  getAvailableTablesCount(type: "pool" | "snooker", startISO: string, endISO: string): number {
    const matchingTables = this.tables.filter((t) => t.type === type && t.active);
    const total = matchingTables.length; // exactly 3
    const slotStartMs = new Date(startISO).getTime();
    const slotEndMs = new Date(endISO).getTime();

    const bookedTableIds = new Set<string>();
    this.bookings.forEach((b) => {
      if (b.status === "cancelled" || b.status === "no_show" || b.status === "completed") return;
      const table = this.tables.find((t) => t.id === b.table_id);
      if (!table || table.type !== type) return;

      const clean = b.during.replace(/[\[\]\(\)"]/g, "");
      const [startStr, endStr] = clean.split(",");
      if (!startStr || !endStr) return;
      const bStartMs = new Date(startStr).getTime();
      const bEndMs = new Date(endStr).getTime();
      if (slotStartMs < bEndMs && slotEndMs > bStartMs) {
        bookedTableIds.add(b.table_id);
      }
    });

    return Math.max(0, total - bookedTableIds.size);
  }

  findAvailableTableForSlot(type: "pool" | "snooker", startISO: string, endISO: string): GameTable | null {
    const matchingTables = this.tables.filter((t) => t.type === type && t.active);
    const slotStartMs = new Date(startISO).getTime();
    const slotEndMs = new Date(endISO).getTime();

    for (const table of matchingTables) {
      const isBooked = this.bookings.some((b) => {
        if (b.table_id !== table.id) return false;
        if (b.status === "cancelled" || b.status === "no_show" || b.status === "completed") return false;
        const clean = b.during.replace(/[\[\]\(\)"]/g, "");
        const [startStr, endStr] = clean.split(",");
        if (!startStr || !endStr) return false;
        const bStartMs = new Date(startStr).getTime();
        const bEndMs = new Date(endStr).getTime();
        return slotStartMs < bEndMs && slotEndMs > bStartMs;
      });
      if (!isBooked) return table;
    }
    return null;
  }

  checkInWithPinAutoAllocate(pinInput: string): {
    success: boolean;
    error?: string;
    table?: GameTable;
    booking?: Booking;
    session?: Session;
  } {
    const clean = pinInput.trim().toUpperCase();
    if (!clean) {
      return { success: false, error: "Please enter your 6-digit PIN" };
    }

    // Match by PIN or by booking code
    const booking = this.bookings.find(
      (b) =>
        (b.pin_hash === clean || b.booking_code.toUpperCase() === clean) &&
        (b.status === "confirmed" || b.status === "pending" || b.status === "checked_in")
    );

    if (!booking) {
      return { success: false, error: "Invalid PIN or reservation not found." };
    }

    if (booking.status === "completed") {
      return { success: false, error: "This reservation has already concluded and billed" };
    }

    // Check if session already active for this booking
    const activeSession = this.sessions.find((s) => s.booking_id === booking.id && !s.ended_at);
    if (activeSession) {
      const tbl = this.tables.find((t) => t.id === activeSession.table_id);
      return {
        success: true,
        table: tbl,
        booking,
        session: activeSession,
      };
    }

    // Detect game type (pool or snooker)
    const assignedTable = this.tables.find((t) => t.id === booking.table_id);
    const gameType: "pool" | "snooker" =
      assignedTable?.type || (booking.table_id?.includes("snooker") ? "snooker" : "pool");

    // Get the 3 tables for this game
    const candidateTables = this.tables.filter((t) => t.type === gameType && t.active);

    // Prefer pre-assigned table if it has no active running session
    let allocatedTable: GameTable | undefined;
    if (
      assignedTable &&
      !this.sessions.some((s) => s.table_id === assignedTable.id && !s.ended_at)
    ) {
      allocatedTable = assignedTable;
    } else {
      // Otherwise find the first candidate table of this discipline with no running session
      allocatedTable = candidateTables.find((t) => {
        const hasRunning = this.sessions.some((s) => s.table_id === t.id && !s.ended_at);
        return !hasRunning;
      });
    }

    if (!allocatedTable) {
      return {
        success: false,
        error: `All 3 ${gameType === "snooker" ? "Snooker" : "Pool"} tables are currently occupied. Please wait for an active game to finish.`,
      };
    }

    // Auto-allocate this table
    booking.table_id = allocatedTable.id;
    booking.status = "checked_in";

    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newSession: Session = {
      id: sessionId,
      booking_id: booking.id,
      table_id: allocatedTable.id,
      started_at: new Date().toISOString(),
      ended_at: null,
      extra_minutes: 0,
      time_charge: booking.amount,
    };

    this.sessions.push(newSession);
    allocatedTable.status = "running";

    this.saveToStorage();
    this.notify();

    return {
      success: true,
      table: allocatedTable,
      booking,
      session: newSession,
    };
  }

  startSessionWithPin(codeOrPin: string, optionalPin?: string): { success: boolean; error?: string; sessionId?: string } {
    // If only one argument is provided, or both are provided, auto-allocate
    const pinToTry = optionalPin ? optionalPin.trim() : codeOrPin.trim();
    const autoRes = this.checkInWithPinAutoAllocate(pinToTry);
    if (autoRes.success && autoRes.session) {
      return { success: true, sessionId: autoRes.session.id };
    }
    
    // Also try looking up by code if pinToTry wasn't found
    if (optionalPin && codeOrPin) {
      const byCodeRes = this.checkInWithPinAutoAllocate(codeOrPin.trim());
      if (byCodeRes.success && byCodeRes.session) {
        return { success: true, sessionId: byCodeRes.session.id };
      }
    }

    return { success: false, error: autoRes.error || "PIN verification failed" };
  }

  addExtraTime(sessionId: string, minutes: number): { success: boolean; error?: string } {
    const session = this.sessions.find((s) => s.id === sessionId && !s.ended_at);
    if (!session) return { success: false, error: "Session not found" };

    session.extra_minutes += minutes;

    // Proration
    const table = this.tables.find((t) => t.id === session.table_id);
    const hourlyRate = table?.type === "snooker" ? 450 : 300;
    session.time_charge += Math.round((minutes / 60) * hourlyRate);

    this.saveToStorage();
    return { success: true };
  }

  endSession(sessionId: string): { success: boolean; billId?: string; bill?: Bill; error?: string } {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, error: "Session not found" };

    // Idempotent return of existing bill if session already ended
    const existingBill = this.bills.find((b) => b.session_id === sessionId);
    if (session.ended_at && existingBill) {
      return { success: true, billId: existingBill.id, bill: existingBill };
    }

    const endedAt = new Date().toISOString();
    session.ended_at = endedAt;

    const table = this.tables.find((t) => t.id === session.table_id);
    if (table) {
      table.status = "free";
    }

    const booking = this.bookings.find((b) => b.id === session.booking_id);
    if (booking) {
      booking.status = "completed";
    }

    // Sum food orders
    let foodTotal = 0;
    const sessionOrders = this.orders.filter((o) => o.session_id === sessionId);
    sessionOrders.forEach((o) => {
      if (o.status === "served") {
        o.items?.forEach((i) => {
          foodTotal += i.price * i.qty;
        });
      }
    });

    const billId = `bill-${Date.now()}`;
    const year = new Date().getFullYear();
    const sequence = String(this.bills.length + 1).padStart(5, "0");
    const billNumber = `QN-${year}-${sequence}`;

    const subtotal = session.time_charge + foodTotal;
    const taxAmount = Math.round(subtotal * 0.05);
    const total = subtotal + taxAmount;

    const newBill: Bill = {
      id: billId,
      bill_number: billNumber,
      session_id: sessionId,
      time_charge: session.time_charge,
      food_charge: foodTotal,
      tax_amount: taxAmount,
      discount_amount: 0,
      total,
      amount_paid: 0,
      balance_due: total,
      paid: false,
      pay_mode: null,
      paid_at: null,
      created_at: endedAt,
      session,
      booking,
      table,
    };

    this.bills.push(newBill);
    this.saveToStorage();
    return { success: true, billId, bill: newBill };
  }

  markBillPaid(billId: string, payMode: "cash" | "upi" | "card") {
    const bill = this.bills.find((b) => b.id === billId);
    if (bill) {
      bill.paid = true;
      bill.pay_mode = payMode;
      bill.amount_paid = bill.total;
      bill.balance_due = 0;
      bill.paid_at = new Date().toISOString();
      this.saveToStorage();
    }
  }

  placeOrder(tableId: string, items: { menuItemId: string; qty: number }[]): { success: boolean; orderId?: string; error?: string } {
    const running = this.getRunningSessionForTable(tableId);
    if (!running) {
      return { success: false, error: "No game running on this table. Ask staff to start one." };
    }

    const orderId = `ord-${Date.now()}`;
    const orderItems = items.map((i, idx) => {
      const itemDef = this.menu.find((m) => m.id === i.menuItemId);
      return {
        id: `oi-${Date.now()}-${idx}`,
        order_id: orderId,
        menu_item_id: i.menuItemId,
        qty: i.qty,
        price: itemDef?.price || 0,
        menu_item: itemDef,
      };
    });

    const newOrder: Order = {
      id: orderId,
      session_id: running.id,
      table_id: tableId,
      status: "new",
      created_at: new Date().toISOString(),
      items: orderItems,
    };

    this.orders.unshift(newOrder);
    this.saveToStorage();
    return { success: true, orderId };
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveToStorage();
    }
  }

  setTableStatus(tableId: string, status: TableStatus) {
    const table = this.tables.find((t) => t.id === tableId);
    if (table) {
      table.status = status;
      this.saveToStorage();
    }
  }

  addExpense(category: string, amount: number, note?: string) {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      category,
      amount,
      spent_on: new Date().toISOString().split("T")[0]!,
      note: note || "",
    };
    this.expenses.unshift(newExpense);
    this.saveToStorage();
  }

  addMenuItem(item: Omit<MenuItem, "id">) {
    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`,
    };
    this.menu.push(newItem);
    this.saveToStorage();
  }

  toggleMenuAvailability(menuId: string) {
    const item = this.menu.find((m) => m.id === menuId);
    if (item) {
      item.available = !item.available;
      this.saveToStorage();
    }
  }

  refresh() {
    this.loadFromStorage();
  }

  resetForTesting() {
    this.tables = JSON.parse(JSON.stringify(INITIAL_TABLES));
    this.bookings = [];
    this.sessions = [];
    this.orders = [];
    this.bills = [];
    this.expenses = [];
  }

  addExtraMinutes(sessionId: string, minutes: number): boolean {
    const session = this.sessions.find((s) => s.id === sessionId && !s.ended_at);
    if (!session) return false;
    session.extra_minutes = (session.extra_minutes || 0) + minutes;
    const table = this.tables.find((t) => t.id === session.table_id);
    const hourlyRate = table?.hourly_rate || (table?.type === "snooker" ? 500 : 350);
    const totalDurationHrs = (60 + session.extra_minutes) / 60;
    session.time_charge = Math.round(totalDurationHrs * hourlyRate);
    this.saveToStorage();
    return true;
  }

  createOrder(
    arg1: string | { table_id: string; menu_item_id: string; status?: OrderStatus },
    arg2?: { menuItemId: string; qty: number }[]
  ): { success: boolean; orderId?: string; error?: string } {
    if (typeof arg1 === "object") {
      const tableId = arg1.table_id;
      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const itemDef = this.menu.find((m) => m.id === arg1.menu_item_id);
      const newOrder: Order = {
        id: orderId,
        session_id: this.getRunningSessionForTable(tableId)?.id || "adhoc-session",
        table_id: tableId,
        status: arg1.status || "new",
        created_at: new Date().toISOString(),
        menu_item_id: arg1.menu_item_id,
        items: [
          {
            id: `oi-${Date.now()}`,
            order_id: orderId,
            menu_item_id: arg1.menu_item_id,
            qty: 1,
            price: itemDef?.price || 0,
            menu_item: itemDef,
          },
        ],
      };
      this.orders.unshift(newOrder);
      this.saveToStorage();
      return { success: true, orderId };
    }
    return this.placeOrder(arg1, arg2 || []);
  }

  // --- WAITING LIST MODULE ---
  getWaitingList(): WaitingListEntry[] {
    return [...this.waitingList];
  }

  getEstimatedWaitMinutes(discipline: "pool" | "snooker"): number {
    const candidateTables = this.tables.filter((t) => t.type === discipline && t.active);
    const activeSessions = this.sessions.filter(
      (s) => candidateTables.some((t) => t.id === s.table_id) && !s.ended_at
    );

    // If any table is currently free, wait time is 0
    if (activeSessions.length < candidateTables.length) {
      return 0;
    }

    // Otherwise find the session with the least remaining time
    const now = Date.now();
    let minRemainingMinutes = 60;

    activeSessions.forEach((s) => {
      const elapsedMins = Math.floor((now - new Date(s.started_at).getTime()) / 60000);
      const totalAllocatedMins = 60 + (s.extra_minutes || 0);
      const remainingMins = Math.max(5, totalAllocatedMins - elapsedMins);
      if (remainingMins < minRemainingMinutes) {
        minRemainingMinutes = remainingMins;
      }
    });

    return minRemainingMinutes;
  }

  addToWaitingList(params: {
    customerName: string;
    customerPhone: string;
    discipline: "pool" | "snooker";
    partySize?: number;
    preferredDuration?: number;
    notes?: string;
  }): WaitingListEntry {
    const estimatedWait = this.getEstimatedWaitMinutes(params.discipline);
    const entry: WaitingListEntry = {
      id: `wl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      customer_name: params.customerName.trim(),
      customer_phone: params.customerPhone.trim(),
      discipline: params.discipline,
      party_size: params.partySize || 2,
      preferred_duration: params.preferredDuration || 60,
      created_at: new Date().toISOString(),
      status: "waiting",
      estimated_wait_minutes: estimatedWait,
      notes: params.notes || "",
    };

    this.waitingList.unshift(entry);
    this.saveToStorage();
    return entry;
  }

  updateWaitingListStatus(
    id: string,
    status: WaitingListEntry["status"],
    allocatedTableId?: string
  ): boolean {
    const entry = this.waitingList.find((w) => w.id === id);
    if (!entry) return false;
    entry.status = status;
    if (allocatedTableId) entry.allocated_table_id = allocatedTableId;
    this.saveToStorage();
    return true;
  }

  // --- SHIFT HANDOVER MODULE ---
  getShiftHandovers(): ShiftHandover[] {
    return [...this.shiftHandovers];
  }

  submitShiftHandover(data: {
    outgoingStaffId: string;
    outgoingStaffName: string;
    cashDrawerActual: number;
    operationalNotes: string;
  }): ShiftHandover {
    // Calculate expected cash from bills paid in cash today
    const todayStr = new Date().toISOString().split("T")[0];
    const cashBills = this.bills.filter(
      (b) => b.paid && b.pay_mode === "cash" && b.paid_at && b.paid_at.startsWith(todayStr!)
    );
    const expectedCash = cashBills.reduce((acc, b) => acc + b.total, 0);
    const completedSessionsCount = this.sessions.filter(
      (s) => s.ended_at && s.ended_at.startsWith(todayStr!)
    ).length;
    const unpaidBillsCount = this.bills.filter((b) => !b.paid).length;

    const handover: ShiftHandover = {
      id: `sh-${Date.now()}`,
      shift_date: todayStr!,
      outgoing_staff_id: data.outgoingStaffId,
      outgoing_staff_name: data.outgoingStaffName,
      cash_drawer_expected: expectedCash,
      cash_drawer_actual: data.cashDrawerActual,
      cash_variance: data.cashDrawerActual - expectedCash,
      completed_sessions_count: completedSessionsCount,
      unpaid_bills_count: unpaidBillsCount,
      operational_notes: data.operationalNotes,
      status: "submitted",
      created_at: new Date().toISOString(),
    };

    this.shiftHandovers.unshift(handover);
    this.saveToStorage();
    return handover;
  }

  acknowledgeShiftHandover(id: string, staffId: string, staffName: string): boolean {
    const handover = this.shiftHandovers.find((sh) => sh.id === id);
    if (!handover) return false;
    handover.incoming_staff_id = staffId;
    handover.incoming_staff_name = staffName;
    handover.status = "acknowledged";
    handover.acknowledged_at = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  // --- DAILY CLOSING & CASH RECONCILIATION ---
  getDailyClosings(): DailyClosing[] {
    return [...this.dailyClosings];
  }

  computeDailyClosingSummary(dateStr?: string) {
    const targetDate = dateStr || new Date().toISOString().split("T")[0]!;
    const dayBills = this.bills.filter((b) => {
      const bDate = (b.paid_at || b.created_at || "").split("T")[0];
      return bDate === targetDate;
    });

    const daySessions = this.sessions.filter((s) => {
      const sDate = (s.ended_at || s.started_at || "").split("T")[0];
      return sDate === targetDate;
    });

    let cashCollected = 0;
    let upiCollected = 0;
    let cardCollected = 0;
    let onlineCollected = 0;
    let outstandingBalance = 0;
    let totalRevenue = 0;

    dayBills.forEach((b) => {
      totalRevenue += b.total;
      if (b.paid) {
        if (b.pay_mode === "cash") cashCollected += b.total;
        else if (b.pay_mode === "upi") upiCollected += b.total;
        else if (b.pay_mode === "card") cardCollected += b.total;
        else onlineCollected += b.total;
      } else {
        outstandingBalance += b.balance_due || b.total;
      }
    });

    return {
      targetDate,
      totalSessions: daySessions.length,
      totalRevenue,
      cashCollected,
      upiCollected,
      cardCollected,
      onlineCollected,
      refundsTotal: 0,
      discountsTotal: 0,
      outstandingBalance,
      expectedCash: cashCollected,
    };
  }

  submitDailyClosing(data: {
    closedById: string;
    closedByName: string;
    actualCash: number;
    closingNotes?: string;
    dateStr?: string;
  }): DailyClosing {
    const summary = this.computeDailyClosingSummary(data.dateStr);
    const variance = data.actualCash - summary.expectedCash;

    const closing: DailyClosing = {
      id: `dc-${Date.now()}`,
      closing_date: summary.targetDate,
      closed_by_id: data.closedById,
      closed_by_name: data.closedByName,
      total_sessions: summary.totalSessions,
      total_revenue: summary.totalRevenue,
      cash_collected: summary.cashCollected,
      upi_collected: summary.upiCollected,
      card_collected: summary.cardCollected,
      online_collected: summary.onlineCollected,
      refunds_total: 0,
      discounts_total: 0,
      outstanding_balance: summary.outstandingBalance,
      expected_cash: summary.expectedCash,
      actual_cash: data.actualCash,
      cash_variance: variance,
      closing_notes: data.closingNotes || "",
      status: Math.abs(variance) > 0 ? "discrepancy" : "submitted",
      created_at: new Date().toISOString(),
    };

    this.dailyClosings.unshift(closing);
    this.saveToStorage();
    return closing;
  }

  approveDailyClosing(id: string, approvedBy: string): boolean {
    const closing = this.dailyClosings.find((c) => c.id === id);
    if (!closing) return false;
    closing.status = "approved";
    closing.approved_by = approvedBy;
    closing.approved_at = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  // --- MEMBERSHIP & REWARDS MODULE ---
  getMembershipPlans(): MembershipPlan[] {
    return [...this.membershipPlans];
  }

  getCustomerMemberships(): CustomerMembership[] {
    return [...this.customerMemberships];
  }

  getMembershipForCustomer(phone: string): CustomerMembership | undefined {
    return this.customerMemberships.find(
      (m) => m.customer_phone.replace(/\D/g, "") === phone.replace(/\D/g, "") && m.active
    );
  }

  enrollMembership(params: {
    customerPhone: string;
    customerName: string;
    planId: string;
  }): CustomerMembership | null {
    const plan = this.membershipPlans.find((p) => p.id === params.planId);
    if (!plan) return null;

    const now = new Date();
    const expiry = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

    const membership: CustomerMembership = {
      id: `mem-${Date.now()}`,
      customer_phone: params.customerPhone.trim(),
      customer_name: params.customerName.trim(),
      plan_id: plan.id,
      plan_name: plan.name,
      tier: plan.tier,
      start_date: now.toISOString(),
      expiry_date: expiry.toISOString(),
      points_balance: 100, // Welcome points
      active: true,
      created_at: now.toISOString(),
    };

    this.customerMemberships.unshift(membership);
    this.addRewardPoints(params.customerPhone, 100, `Welcome bonus for ${plan.name} enrollment`);
    this.saveToStorage();
    return membership;
  }

  getRewardLedger(customerPhone?: string): RewardLedgerEntry[] {
    if (!customerPhone) return [...this.rewardLedger];
    const cleanPhone = customerPhone.replace(/\D/g, "");
    return this.rewardLedger.filter((r) => r.customer_phone.replace(/\D/g, "") === cleanPhone);
  }

  addRewardPoints(phone: string, points: number, note?: string): void {
    const entry: RewardLedgerEntry = {
      id: `rw-${Date.now()}`,
      customer_phone: phone.trim(),
      points,
      type: "earned",
      note: note || "Points earned on table spend",
      created_at: new Date().toISOString(),
    };
    this.rewardLedger.unshift(entry);

    const mem = this.getMembershipForCustomer(phone);
    if (mem) {
      mem.points_balance += points;
    }
    this.saveToStorage();
  }

  redeemRewardPoints(phone: string, points: number): boolean {
    const mem = this.getMembershipForCustomer(phone);
    if (!mem || mem.points_balance < points) return false;

    mem.points_balance -= points;
    this.rewardLedger.unshift({
      id: `rw-${Date.now()}`,
      customer_phone: phone.trim(),
      points: -points,
      type: "redeemed",
      note: `Redeemed ${points} points against playing charges`,
      created_at: new Date().toISOString(),
    });

    this.saveToStorage();
    return true;
  }

  // --- MAINTENANCE & CONFLICT CHECKING ---
  getMaintenanceRecords(): MaintenanceRecord[] {
    return [...this.maintenanceRecords];
  }

  checkMaintenanceConflict(
    tableId: string,
    startISO: string,
    endISO: string
  ): { hasConflict: boolean; conflictingBookings: Booking[] } {
    const reqStartMs = new Date(startISO).getTime();
    const reqEndMs = new Date(endISO).getTime();

    const conflicts = this.bookings.filter((b) => {
      if (b.table_id !== tableId) return false;
      if (b.status === "cancelled" || b.status === "completed" || b.status === "no_show") return false;

      const clean = b.during.replace(/[\[\]\(\)"]/g, "");
      const [startStr, endStr] = clean.split(",");
      if (!startStr || !endStr) return false;
      const bStartMs = new Date(startStr).getTime();
      const bEndMs = new Date(endStr).getTime();

      return reqStartMs < bEndMs && reqEndMs > bStartMs;
    });

    return {
      hasConflict: conflicts.length > 0,
      conflictingBookings: conflicts,
    };
  }

  scheduleMaintenance(record: Omit<MaintenanceRecord, "id" | "reported_at" | "status">): MaintenanceRecord {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `maint-${Date.now()}`,
      reported_at: new Date().toISOString(),
      status: "open",
    };

    this.maintenanceRecords.unshift(newRecord);
    const table = this.tables.find((t) => t.id === record.table_id);
    if (table) {
      table.status = "maintenance";
    }

    this.saveToStorage();
    return newRecord;
  }

  resolveMaintenance(id: string, notes?: string): boolean {
    const rec = this.maintenanceRecords.find((m) => m.id === id);
    if (!rec) return false;
    rec.status = "resolved";
    rec.resolved_at = new Date().toISOString();
    if (notes) rec.notes = notes;

    const table = this.tables.find((t) => t.id === rec.table_id);
    if (table && table.status === "maintenance") {
      table.status = "free";
    }

    this.saveToStorage();
    return true;
  }

  // --- TABLET OPERATING MODE ---
  getIsTabletMode(): boolean {
    return this.isTabletMode;
  }

  toggleTabletMode(): boolean {
    this.isTabletMode = !this.isTabletMode;
    this.saveToStorage();
    return this.isTabletMode;
  }
}

export const venueStore = new VenueStore();
