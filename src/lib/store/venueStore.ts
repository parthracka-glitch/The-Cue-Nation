"use client";

import { GameTable, Booking, Session, Order, Bill, MenuItem, Expense, TableStatus, OrderStatus } from "@/types/database";

const INITIAL_TABLES: GameTable[] = [
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
  {
    id: "table-1",
    name: "Table 1 — Brunswick Gold Crown",
    type: "pool",
    status: "free",
    qr_secret: "secret-table-1",
    active: true,
  },
  {
    id: "table-2",
    name: "Table 2 — Rasson Ox Pool",
    type: "pool",
    status: "free",
    qr_secret: "secret-table-2",
    active: true,
  },
  {
    id: "table-3",
    name: "Table 3 — Diamond Pro-Am",
    type: "pool",
    status: "running",
    qr_secret: "secret-table-3",
    active: true,
  },
  {
    id: "table-4",
    name: "Table 4 — Dynamic III Pool",
    type: "pool",
    status: "free",
    qr_secret: "secret-table-4",
    active: true,
  },
  {
    id: "table-5",
    name: "Table 5 — Riley Aristocrat Snooker",
    type: "snooker",
    status: "free",
    qr_secret: "secret-table-5",
    active: true,
  },
  {
    id: "table-6",
    name: "Table 6 — Star Tournament Snooker",
    type: "snooker",
    status: "free",
    qr_secret: "secret-table-6",
    active: true,
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
      const t = localStorage.getItem("cn_tables");
      const b = localStorage.getItem("cn_bookings");
      const s = localStorage.getItem("cn_sessions");
      const o = localStorage.getItem("cn_orders");
      const bi = localStorage.getItem("cn_bills");
      const e = localStorage.getItem("cn_expenses");
      const m = localStorage.getItem("cn_menu");

      if (t) this.tables = JSON.parse(t);
      if (b) this.bookings = JSON.parse(b);
      if (s) this.sessions = JSON.parse(s);
      if (o) this.orders = JSON.parse(o);
      if (bi) this.bills = JSON.parse(bi);
      if (e) this.expenses = JSON.parse(e);
      if (m) this.menu = JSON.parse(m);
    } catch {
      // fallback to initial
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
      id: `b-${Date.now()}`,
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

  startSessionWithPin(code: string, pin: string): { success: boolean; error?: string; sessionId?: string } {
    const cleanCode = code.trim().toUpperCase();
    const booking = this.bookings.find(
      (b) => b.booking_code.toUpperCase() === cleanCode && b.status === "confirmed"
    );

    if (!booking) {
      return { success: false, error: "Booking code not found or already checked in" };
    }

    if (booking.pin_attempts >= 5) {
      return { success: false, error: "Too many failed attempts. PIN locked. Contact owner." };
    }

    if (booking.pin_hash !== pin.trim()) {
      booking.pin_attempts += 1;
      this.saveToStorage();
      return {
        success: false,
        error: `Incorrect PIN. ${5 - booking.pin_attempts} attempts remaining.`,
      };
    }

    // Check if table already has a running session
    const existing = this.getRunningSessionForTable(booking.table_id);
    if (existing) {
      return { success: false, error: "Table already has an active running session" };
    }

    // Start session
    booking.status = "checked_in";
    const sessionId = `sess-${Date.now()}`;
    const newSession: Session = {
      id: sessionId,
      booking_id: booking.id,
      table_id: booking.table_id,
      started_at: new Date().toISOString(),
      ended_at: null,
      extra_minutes: 0,
      time_charge: booking.amount,
    };

    this.sessions.push(newSession);

    const table = this.tables.find((t) => t.id === booking.table_id);
    if (table) {
      table.status = "running";
    }

    this.saveToStorage();
    return { success: true, sessionId };
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
