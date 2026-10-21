# 🎱 Cue Nation — Implementation Plan & Progress Tracker

Based on the [Master Blueprint](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/Cue%20Nation%20Project/cue-nation-master-blueprint.md), the entire production platform has been constructed in a structured format:

---

## 🏗️ Staged Roadmap Completion

- [x] **Stage 0: Foundation & Core Configuration**
  - Next.js 15 App Router + TypeScript (strict)
  - Tailwind CSS configured with exact "Parlour Lounge" brand tokens:
    - *Parlour Cream* (`#EDDFC2`, `#F6EFDF`, `#FBF7EC`)
    - *Baize Teal* (`#0A5551`, `#063B38`, `#2FA39A`)
    - *Smoked Bronze* (`#6D5330`, `#5A4427`, `#B8925A`)
    - *Midnight* (`#010101`, `#0D1716`, `#1E2B29`)
  - Typography setup (Playfair Display for headers, Inter with tabular numbers for timers/currency)
  - Supabase SQL Migrations (`0001` to `0006`) + `seed.sql`
  - Safe environment configuration (`lib/env.ts`)
  - Supabase client & server wrappers (`lib/supabase/client.ts`, `server.ts`, `admin.ts`)

- [x] **Stage 1: Auth & Role Architecture**
  - Supabase Auth integration (Google OAuth + Email/Password)
  - Role-based access control (RBAC): `customer`, `staff`, `owner`
  - Role switcher bar allowing instant inspection of all 3 portals
  - User profile management & customer bookings view (`/profile`)

- [x] **Stage 2: Public Venue Experience & Brand**
  - High-impact Parlour Lounge Hero section with tagline *"Own the Table"*
  - Dynamic Table Carousel (Pool & Snooker tables, pricing, real-time live availability badges)
  - In-house Café Highlights with artisanal menu preview
  - About Cue Nation club story & interactive visit details
  - Full SEO metadata, JSON-LD `LocalBusiness` schema, OpenGraph tags

- [x] **Stage 3: Booking Engine & Anti-Double-Booking Live Sync**
  - 3-step intuitive booking flow (`/book`: Table Selection ➔ Date/Time Slots ➔ Guest Details & Confirmation)
  - PostgreSQL exclusion constraint (`no_overlap`) & atomic `create_booking` RPC
  - Realtime availability subscription via `useAvailability`
  - Booking confirmation card with Booking Code (`CN-XXXXXX`), single-reveal 6-digit PIN, copy button & confetti celebration

- [x] **Stage 4: Staff Floor Operations & Live Table Timers**
  - Tablet-optimized dark mode floor grid (`/staff`)
  - Table cards with visual status (Available, Booked, In Play with pulse, Offline)
  - PIN Verification Check-in Modal (`start_session` RPC)
  - Live session timers synchronized with server clock (`useSessionTimer`)
  - Extra time extension (+15, +30, +60 min) with conflict detection against upcoming bookings
  - End session handler

- [x] **Stage 5: Walk-In Bookings & Operations Management**
  - Walk-in / offline booking modal (blocks public slots instantly with same exclusion rules)
  - Staff Bookings Management table with search, status filters, and reschedule capabilities

- [x] **Stage 6: QR Table Ordering & Kitchen Display System (KDS)**
  - Table-signed QR token generation & verification (`/t/[tableToken]/menu`)
  - Active session validation (orders only accepted while table is in play)
  - Café food/drink ordering interface with live cart
  - Live Kitchen Display System (`/staff/kitchen`) with New ➔ Preparing ➔ Served ticket status & audio chimes

- [x] **Stage 7: Combined Billing Engine & POS**
  - Accurate bill calculation (`calculateBill` utility): base time + extra time + served café items
  - Vitest test suite (`calculate.test.ts`) passing with 100% assertion accuracy
  - Combined Bill View (`/staff/billing`) with Cash / UPI / Card payment settlement
  - Thermal receipt printer-friendly view

- [x] **Stage 8: Owner Dashboard & Analytics**
  - Overview KPI metrics: Daily/Monthly Revenue, Active Sessions, Total Bookings, Expenses
  - Monthly calendar & hourly peak-time heatmap
  - Expense tracking & categorization
  - Export capabilities (Excel & PDF reports)
  - Dynamic settings for venue pricing, menu items, and staff members
