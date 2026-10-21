"use client";

import { GameTable, Booking, Session, Order, Bill, MenuItem, Expense, TableStatus, OrderStatus } from "@/types/database";

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
    } catch {
      // ignore storage errors
    }
    this.notify();
  }

  private loadFromStorage() {
    try {
      const CURRENT_STORE_VERSION = "v4_3pool_3snooker";
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

      if (b) this.bookings = JSON.parse(b);
      if (s) this.sessions = JSON.parse(s);
      if (o) this.orders = JSON.parse(o);
      if (bi) this.bills = JSON.parse(bi);
      if (e) this.expenses = JSON.parse(e);
      if (m) this.menu = JSON.parse(m);
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

  endSession(sessionId: string): { success: boolean; billId?: string; error?: string } {
    const session = this.sessions.find((s) => s.id === sessionId && !s.ended_at);
    if (!session) return { success: false, error: "Active session not found" };

    session.ended_at = new Date().toISOString();

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
    const newBill: Bill = {
      id: billId,
      session_id: sessionId,
      time_charge: session.time_charge,
      food_charge: foodTotal,
      total: session.time_charge + foodTotal,
      paid: false,
      pay_mode: null,
      paid_at: null,
    };

    this.bills.push(newBill);
    this.saveToStorage();
    return { success: true, billId };
  }

  markBillPaid(billId: string, payMode: "cash" | "upi" | "card") {
    const bill = this.bills.find((b) => b.id === billId);
    if (bill) {
      bill.paid = true;
      bill.pay_mode = payMode;
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
}

export const venueStore = new VenueStore();
