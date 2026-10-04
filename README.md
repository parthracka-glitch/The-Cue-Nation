# 🎱 CueClub OS — Enterprise Billiards & Snooker Club Management System

A high-performance, real-time operating system for premium pool and snooker clubs built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **SQLite**.

---

## 🏛️ Architecture & Directory Structure

The project is structured according to clean architecture principles with strict separation of concerns across the backend domain layer, frontend client SDK, UI components, and API controllers:

```
Pool Project/
├── server/                        # 🧠 BACKEND DOMAIN SERVICE LAYER
│   ├── services/                  # Encapsulated business domain services
│   │   ├── session.service.ts     # Floor state, start/pause/resume/transfer sessions
│   │   ├── billing.service.ts     # Split billing, folio generation, voids/refunds
│   │   ├── order.service.ts       # Cafe POS menu, KDS ticket queue, 86 item availability
│   │   ├── reservation.service.ts # Availability, booking engine, Gantt timeline, check-in
│   │   ├── customer.service.ts    # CRM, 10% wallet top-up bonus, Khata repayments
│   │   ├── report.service.ts      # Revenue analytics, table utilization, register day-close
│   │   └── rate.service.ts        # Dynamic weekly rate cards & minute-by-minute simulation
│   ├── utils/                     # Backend utilities & helpers
│   │   ├── api-response.ts        # Standardized JSON success/error response helpers
│   │   └── audit.ts               # Immutable audit logging with user fallback
│   └── index.ts                   # Clean backend barrel export
│
├── client/                        # 🌐 FRONTEND CLIENT SDK & REACT HOOKS
│   ├── api/                       # Strongly typed API clients
│   │   ├── client-fetcher.ts      # Base HTTP client with error unwrapping
│   │   ├── floor.api.ts           # Table controls, session management
│   │   ├── pos.api.ts             # Cafe catalog & order placement
│   │   ├── checkout.api.ts        # Bill details & split settlements
│   │   ├── kitchen.api.ts         # KDS ticket status transitions
│   │   ├── reservations.api.ts    # Public & admin reservation APIs
│   │   ├── customers.api.ts       # Customer CRM & wallet operations
│   │   └── reports.api.ts         # Financial reports & day-close register
│   ├── hooks/                     # Custom domain hooks
│   │   ├── use-floor.ts           # 5-second polling SWR floor manager
│   │   ├── use-session-timer.ts   # Millisecond-accurate live session cost ticker
│   │   ├── use-kitchen-tickets.ts # KDS queue with synthetic Web Audio chime
│   │   └── use-pos-cart.ts        # Cafe shopping cart state management
│   └── index.ts                   # Clean frontend client barrel export
│
├── components/                    # 🎨 MODULAR UI COMPONENTS
│   ├── floor/                     # Live table cards, floor grid, start session modal
│   │   ├── floor-grid.tsx
│   │   ├── table-card.tsx
│   │   └── start-session-modal.tsx
│   ├── kitchen/                   # Kitchen Display System (KDS) board & cards
│   │   ├── kds-board.tsx
│   │   └── ticket-card.tsx
│   ├── layout/                    # Admin sidebar, topbar, public navigation & footers
│   │   ├── admin-sidebar.tsx
│   │   ├── admin-topbar.tsx
│   │   ├── public-header.tsx
│   │   └── public-footer.tsx
│   ├── ui/                        # Accessible design primitives (Radix UI / Tailwind)
│   │   ├── badge.tsx, button.tsx, card.tsx, dialog.tsx, input.tsx, label.tsx
│   │   └── select.tsx, separator.tsx, switch.tsx, table.tsx, tabs.tsx
│   ├── providers/                 # React context providers (NextAuth session provider)
│   ├── shared/                    # Interactive demo tour & guided walkthrough
│   └── index.ts                   # Components barrel export
│
├── app/                           # ⚡ NEXT.JS APP ROUTER (PAGES & CONTROLLERS)
│   ├── api/                       # Ultra-thin REST controllers delegating to server/
│   │   ├── admin/                 # Admin routes: floor, sessions, bills, checkout, POS, etc.
│   │   ├── kitchen/               # KDS ticket status updates
│   │   ├── public/                # Public availability, booking, booking lookup
│   │   └── auth/                  # NextAuth credentials authentication
│   ├── admin/                     # Admin dashboard views (Floor, POS, Bills, CRM, Reports)
│   ├── book/                      # Public multi-step table reservation & QR lookup
│   ├── kitchen/                   # KDS live monitor with audio notifications
│   ├── account/                   # Customer loyalty portal (Wallet balance & ledger)
│   ├── login/                     # Role-based credential authentication
│   └── page.tsx                   # Public landing page with live table availability
│
├── lib/                           # 📐 SHARED DOMAIN UTILITIES
│   ├── pricing/                   # Dynamic minute-by-minute pricing engine
│   ├── money.ts                   # Integer paise currency utilities (zero rounding error)
│   ├── auth.ts                    # NextAuth credentials provider configuration
│   └── db.ts                      # Prisma client singleton
│
├── prisma/                        # 🗄️ DATABASE SCHEMA & SEED SCRIPT
│   ├── schema.prisma              # Complete database schema
│   └── seed.ts                    # Deterministic realistic demo seed data
│
└── __tests__/                     # 🧪 UNIT TEST SUITE (VITEST)
    ├── pricing.test.ts            # Dynamic time bands, frame billing, packages, grace periods
    └── settlement.test.ts         # Split settlements, wallet/Khata ledger deductions
```

---

## ⚡ Core Business Rules & Invariants

1. **Integer Paise Everywhere**:
   - All monetary amounts (`totalPaise`, `subtotalPaise`, `taxPaise`, `walletBalancePaise`, `creditBalancePaise`) are strictly stored as integers in **paise** (1 INR = 100 paise).
   - Prevents IEEE 754 floating point inaccuracies during split calculations, taxes, or ledger reconciliations.

2. **Split Settlement Conservation**:
   - Equal splits, custom player shares, and item-by-item allocations must strictly sum to `folio.totalPaise`.
   - Any remainder paise during equal division are deterministically assigned to the first payer.

3. **Dynamic Banded Time Pricing**:
   - Matches and sessions that span multiple rate bands (e.g. Afternoon Standard @ ₹300/hr transitioning into Evening Prime @ ₹480/hr) are prorated on an exact minute-by-minute basis.
   - Includes support for per-frame billing (e.g., Snooker @ ₹120/frame) and booked allowances with grace-period overtime waiver.

4. **10% Wallet Reload Bonus**:
   - When a customer tops up their prepaid wallet, they automatically receive an extra 10% credit bonus (e.g. Add ₹2,000 → Credit ₹2,200).

5. **Live Kitchen Display System (KDS)**:
   - Polling queue with color-coded aging alerts (< 10 min normal, 10–20 min amber, > 20 min red alert).
   - Audio chime automatically synthesized via the Web Audio API when new tickets appear.

6. **Day-Close Cash Register Reconciliation**:
   - Verifies expected cash vs actual physical cash drawer count.
   - Calculates discrepancies, breaks down UPI / Card collections, and writes an immutable day-close audit snapshot.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup SQLite Database & Seed Data
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the Vitest test suite covering dynamic time-band pricing and multi-payer split settlements:
```bash
npm test
```
All 14 unit tests pass in under 400ms:
```
 ✓ __tests__/settlement.test.ts  (5 tests)
 ✓ __tests__/pricing.test.ts     (9 tests)
 Test Files  2 passed (2)
      Tests  14 passed (14)
```

Run production type-checking and Next.js build:
```bash
npm run build
```

---

## 👥 Demo Logins & Credentials

All test accounts share the same password: **`admin123`** (or password corresponding to the username).

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cueclub.com` | `admin123` | Full access: Floor, POS, Rates, Reports, Day Close, CRM |
| **Staff** | `staff@cueclub.com` | `staff123` | Floor operations, Table pause/transfer, POS orders, Checkout |
| **Kitchen** | `kitchen@cueclub.com` | `kitchen123` | Kitchen Display System (`/kitchen`) |
| **Customer** | `rahul@gmail.com` | `customer123` | Customer loyalty portal (`/account`), booking lookup |

---

## 🎮 Interactive Demo Tour

When logged into the Admin Dashboard at `/admin`, click the **"Tour Demo"** button in the top navigation bar to access the guided walkthrough showcasing:
1. **Floor Operations**: Starting timed sessions, pause breaks, and table transfers.
2. **Cafe POS**: Adding beverages, sending KDS tickets, and 86-availability toggles.
3. **Checkout & Split Settlements**: Split by player, split by item, wallet/UPI/cash/Khata payments.
4. **CRM & Khata**: 10% wallet bonus reload, customer ledger statements, WhatsApp reminders.
5. **Day-Close Register**: Evening shift cash drawer audit and register lock.
