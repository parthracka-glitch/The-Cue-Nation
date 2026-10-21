# CueNation — Pool Club & Lounge Management Platform

CueNation is a production-grade commercial pool club management application built with Next.js 15, React 19, TypeScript, and a single authoritative backend data store. It unifies customer online bookings, staff floor operations with server-timestamped timers and café POS, and executive administrative dashboards into an integrated system.

---

## Architecture Overview

```
                      ┌───────────────────────────────────────┐
                      │          CueNation Clients            │
                      ├──────────────────┬────────────────────┤
                      │ Customer Website │ Staff Portal       │ Admin Dashboard
                      │ (Public routes)  │ (/staff/* routes)  │ (/admin/* routes)
                      └─────────┬────────┴─────────┬──────────┘
                                │                  │
                                ▼                  ▼
                      ┌───────────────────────────────────────┐
                      │    src/middleware.ts Route Security   │
                      │  (Enforces cookies, roles & tokens)   │
                      └─────────────────┬─────────────────────┘
                                        │
                                        ▼
                      ┌───────────────────────────────────────┐
                      │     Next.js Server API Layer (src/app/api)
                      ├───────────────────────────────────────┤
                      │ • /api/schedule/pools/[id]            │
                      │ • /api/bookings/[id]                  │
                      │ • /api/sessions/[id]/extend | /end    │
                      │ • /api/orders                         │
                      │ • /api/bills?billId=...               │
                      │ • /api/audit-logs                     │
                      └─────────────────┬─────────────────────┘
                                        │
                                        ▼
                      ┌───────────────────────────────────────┐
                      │     Authoritative Core Data Store     │
                      │       (src/lib/services/dataStore)    │
                      ├───────────────────────────────────────┤
                      │ Tables • Bookings • Sessions • Orders │
                      │ Bills  • Payments • Audit Logs • Menu │
                      └───────────────────────────────────────┘
```

---

## Core User Journeys

### 1. Customer Journey
- **Browse & Reserve**: Visit the public website, check real-time table availability, select play duration (60m, 90m, 120m), and view server-calculated pricing.
- **PIN Issuance**: On booking confirmation, the customer receives a unique booking reference (`CN-XXXXXX`) and a confidential 6-digit PIN.
- **Sanitized Public Surface**: Zero administrative controls or staff login buttons appear on public-facing pages.

### 2. Staff Operations & Floor Management
- **Dedicated Login**: Accessed strictly via `/staff/login` with staff/manager credentials (e.g. `STF-101`).
- **PIN Verification & Atomic Check-in**: Arriving customers present their 6-digit PIN. Staff validates the PIN, and the server atomically flips table status to `running`.
- **Authoritative Session Timer**: Timers calculate elapsed time from server timestamps, ensuring continuity across page reloads.
- **Session Extensions**: Supports conflict-aware session extensions with automatic time charge recalculations.
- **Integrated Café POS**: Order café items directly to active table sessions with server-side catalog price resolution.
- **End Session & Consolidated Billing**: Automatically aggregates table time charges and served café items into an itemized bill. Supports UPI, cash, and card payment settlements.

### 3. Administrator Executive Dashboard
- **Executive Overview**: Dedicated `/admin/login` access for owners and managers (`ADM-001`).
- **Live Reconciliation**: Real-time table status grid, booking lifecycle history, and revenue analytics.
- **Audit Logs**: Comprehensive, tamper-proof audit trail for all booking, session, kitchen, and payment activities.

---

## Project Structure

```
CUE-NATION-main/
├── public/                 # Static brand assets and imagery
├── src/
│   ├── app/
│   │   ├── (public)/       # Customer pages (/, /book, /tables, /pricing, /contact)
│   │   ├── staff/          # Staff portal (/staff/login, /staff/dashboard, /staff/cafe, etc.)
│   │   ├── admin/          # Admin dashboard (/admin/login, /admin/dashboard, /admin/audit-logs)
│   │   └── api/            # Server Route Handlers
│   │       ├── bookings/   # Authoritative booking endpoints
│   │       ├── sessions/   # Session check-in, extension, and end-of-session billing
│   │       ├── orders/     # Café order placement and kitchen fulfillment
│   │       ├── bills/      # Consolidated bill lookup, payment, and receipts
│   │       └── audit-logs/ # Immutable security event logs
│   ├── components/         # Reusable UI primitives, badges, modals, and navbars
│   ├── lib/
│   │   ├── services/       # Server business services (dataStore, bookingService, sessionService)
│   │   ├── store/          # Client venue store for optimistic UI updates
│   │   └── billing/        # Billing calculations and tariff definitions
│   ├── types/              # TypeScript database models and status unions
│   └── middleware.ts       # Route protection and role verification
├── tests/                  # Unit and integration test suites
├── test_e2e_complete_flow.js # 48-assertion end-to-end integration and negative test suite
├── .env.example            # Environment variable template with safe placeholders
├── package.json            # Scripts and dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- npm or pnpm

### 1. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Development Server
Start the Next.js development server:
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).

### 4. Running Validation Suites
- **TypeScript Typecheck**:
  ```bash
  npm run typecheck
  ```
- **Unit & Service Tests** (Vitest):
  ```bash
  npm run test
  ```
- **Automated End-to-End Workflow & Negative Tests**:
  ```bash
  node test_e2e_complete_flow.js
  ```

### 5. Production Build
```bash
npm run build
npm run start
```
All 65 routes compile statically and dynamically with strict type checking and zero warnings.

---

## Security Model

1. **Server-Side Pricing**: Prices and bills are calculated exclusively on the server. Client modifications are rejected.
2. **Authoritative Timers**: Session durations rely on server-side ISO timestamps; client-side timer manipulation has no effect on billing.
3. **PIN Life-Cycle**: 6-digit booking PINs are single-use, protected against brute force, and cannot be reused once checked in.
4. **Middleware Protection**: Unauthenticated access to `/staff/*` or `/admin/*` routes is redirected to dedicated login portals.
5. **Audit Logging**: Sensitive operational events (session starts, cancellations, payments, extensions) are permanently recorded in the audit trail.
