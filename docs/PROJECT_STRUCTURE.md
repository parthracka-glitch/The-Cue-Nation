# QNation — Project Structure & Developer Architecture Guide

## 1. Directory Tree & Module Boundaries

The QNation repository is organized as a unified Next.js 15 App Router codebase with clear boundaries between Customer, Staff, and Admin domains:

```text
CUE-NATION-main/
├── public/                 # Static brand assets, logos, and images
├── src/
│   ├── app/                # Next.js 15 App Router tree
│   │   ├── (public)/       # Public Customer Website
│   │   │   ├── page.tsx    # Homepage with Pool & Snooker Flashcards
│   │   │   ├── book/       # Dedicated reservation page
│   │   │   ├── tables/     # Table showcase & layout specifications
│   │   │   ├── pricing/    # Transparent tariff table
│   │   │   ├── rules/      # House rules & code of conduct
│   │   │   └── contact/    # Venue contact info & inquiry form
│   │   ├── staff/          # Staff Floor Operations Portal
│   │   │   ├── login/      # Staff authentication portal
│   │   │   ├── dashboard/  # Live floor tables grid, active sessions, PIN check-in
│   │   │   ├── floor/      # Interactive 6-table floor diagram
│   │   │   ├── sessions/   # Active session timer & controls
│   │   │   ├── cafe/       # Integrated Café POS
│   │   │   └── history/    # Completed session & bill records
│   │   ├── admin/          # Admin Executive Portal
│   │   │   ├── login/      # Executive login
│   │   │   ├── dashboard/  # Executive metrics & revenue breakdown
│   │   │   ├── tables/     # Table configuration (T1-T6 rates)
│   │   │   ├── pricing/    # Tariff management
│   │   │   ├── reports/    # PDF/Excel financial report exports
│   │   │   └── audit-logs/ # Immutable compliance event log
│   │   ├── api/            # Server Route Handlers
│   │   │   ├── bookings/   # Booking creation, lookup, cancellation
│   │   │   ├── sessions/   # Check-in, extension, end-of-session
│   │   │   ├── orders/     # Café order placement & delivery
│   │   │   ├── bills/      # Bill lookup, payments, PDF receipts
│   │   │   ├── schedule/   # Slot availability by game type
│   │   │   └── audit-logs/ # System audit log ingestion & retrieval
│   │   ├── layout.tsx      # Root application layout
│   │   └── globals.css     # Global styles & Tailwind utilities
│   ├── components/         # Reusable UI primitives & layouts
│   │   ├── booking/        # GameFlashcardsBookingSection, BookingSuccessModal
│   │   ├── navigation/     # Navbar, Footer
│   │   └── ui/             # Badges, Buttons, Modals, Spinners
│   ├── lib/                # Authoritative Business Logic & Data
│   │   ├── services/       # Core Server Services
│   │   │   ├── dataStore.ts      # Authoritative in-memory state engine
│   │   │   ├── bookingService.ts # Slot calculations & automatic allocation
│   │   │   └── sessionService.ts # Timers, PIN check-in, session extension
│   │   ├── billing/        # Billing & Tariff Engine
│   │   │   ├── calculate.ts      # Authoritative bill calculation
│   │   │   └── types.ts          # Bill & tariff interfaces
│   │   └── store/          # Client-side optimistic store
│   │       └── venueStore.ts     # Client state mirror for UI updates
│   ├── types/              # Domain TypeScript types
│   │   ├── database.ts     # Table, Booking, Session, Order, Bill models
│   │   └── index.ts        # Common interfaces
│   └── middleware.ts       # Edge route protection & security headers
├── docs/                   # Architectural & Handover Documentation
│   ├── CODEBASE_AUDIT.md
│   ├── REFACTORING_CHANGELOG.md
│   ├── SECURITY_AUDIT.md
│   ├── PROJECT_STRUCTURE.md
│   └── HANDOVER_GUIDE.md
├── scripts/                # Database backup & restore utilities
├── supabase/               # Relational SQL schemas & seeds
├── test_e2e_complete_flow.js # 48-assertion end-to-end integration test runner
├── .env.example            # Environment variables template
├── package.json            # Scripts & dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## 2. Table Inventory Specifications

QNation operates **exactly 6 physical tables**:

| Table ID | Name | Category | Base Hourly Tariff | Min Session | Max Session |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T1** | Royal English Pool 1 | `pool` | ₹250 / hr | 60 mins | 180 mins |
| **T2** | Royal English Pool 2 | `pool` | ₹250 / hr | 60 mins | 180 mins |
| **T3** | Royal English Pool 3 | `pool` | ₹250 / hr | 60 mins | 180 mins |
| **T4** | Tournament Snooker 1 | `snooker` | ₹350 / hr | 60 mins | 180 mins |
| **T5** | Tournament Snooker 2 | `snooker` | ₹350 / hr | 60 mins | 180 mins |
| **T6** | Tournament Snooker 3 | `snooker` | ₹350 / hr | 60 mins | 180 mins |

---

## 3. How to Add a New Feature Without Duplicating Logic

Follow these standard conventions when introducing new functionality:

### 1. Data Models (`src/types/database.ts`)
- Define TypeScript interfaces for any new entity (e.g., membership, tournaments).
- Ensure statuses are strict string union literals (e.g., `'pending' | 'active' | 'completed'`).

### 2. Service Layer (`src/lib/services/`)
- Place all business rules, invariants, and validation inside `src/lib/services/`.
- Never put pricing calculations or table allocation logic directly inside React components.
- Interact with `dataStore.ts` (or database queries) via service functions.

### 3. API Route Handler (`src/app/api/`)
- Create route handlers under `src/app/api/<feature>/route.ts`.
- Validate input request bodies using schemas.
- Call the service layer to perform the operation.
- Return standardized JSON responses: `{ success: true, data: ... }` or `{ success: false, error: ... }`.

### 4. Client Integration (`src/components/` & `src/app/`)
- Use React hooks or fetch calls to interact with the API route.
- If optimistic UI updates are required, update `src/lib/store/venueStore.ts`.
- Wrap protected staff or admin screens with the standard navigation and guard headers.

### 5. Automated Tests
- Add unit tests in `src/lib/services/__tests__/` or `src/lib/billing/__tests__/`.
- Run `npm test` to verify zero regressions.
