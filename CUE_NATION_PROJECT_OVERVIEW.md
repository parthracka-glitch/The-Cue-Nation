# 🎱 CUE NATION — Comprehensive Project Overview & Architecture Guide

> **"Own the Table."**  
> *A unified, luxury commercial cue sports parlour & café management platform combining public online reservations, floor management with authoritative server-side timers, integrated table-side café POS, and executive business analytics.*

---

## 📑 Table of Contents
1. [Executive Summary & Core Vision](#1-executive-summary--core-vision)
2. [Problems Solved & Value Proposition](#2-problems-solved--value-proposition)
3. [User Personas & Role Ecosystem](#3-user-personas--role-ecosystem)
4. [End-to-End Operational Lifecycle](#4-end-to-end-operational-lifecycle)
5. [Core Feature Breakdown by Portal](#5-core-feature-breakdown-by-portal)
   - [Public Customer Experience](#51-public-customer-experience)
   - [Staff Floor Operations & POS](#52-staff-floor-operations--pos)
   - [Kitchen Display System (KDS)](#53-kitchen-display-system-kds)
   - [Owner & Executive Command Centre](#54-owner--executive-command-centre)
6. [Design System & "Parlour Lounge" Brand Identity](#6-design-system--parlour-lounge-brand-identity)
7. [System Architecture & Tech Stack](#7-system-architecture--tech-stack)
8. [Data Model & Authoritative State Engine](#8-data-model--authoritative-state-engine)
9. [Security, Fraud-Prevention & Anti-Cheating](#9-security-fraud-prevention--anti-cheating)
10. [Testing, Reliability & Verification](#10-testing-reliability--verification)
11. [Current Implementation Status & Roadmap](#11-current-implementation-status--roadmap)

---

## 1. Executive Summary & Core Vision

**Cue Nation** is a modern, end-to-end commercial operating system tailored specifically for upscale billiards, pool, and snooker lounges with an integrated artisanal café.

Traditional pool halls suffer from fragmented operations: handwritten chalkboards, physical stopwatches prone to customer disputes, unlinked café orders that slip through without being billed, and zero visibility into hourly table utilization.

**Cue Nation eliminates all of this friction** into a single cohesive web platform:
- **Customers** check live table availability on their smartphones, book a slot, receive a secure 6-digit PIN, and order artisan food/beverages straight from table QR codes.
- **Staff** run the floor using an interactive tabletop floor grid, check in players using their PIN, monitor authoritative server-synced timers, order café items to active tabs, and generate consolidated bills in one tap.
- **Kitchen Staff** receive real-time food and beverage orders on an intuitive digital display and mark items ready/served.
- **Owners** gain total real-time financial oversight, dynamic peak/off-peak tariff controls, shift handover audit trails, and member retention tools.

---

## 2. Problems Solved & Value Proposition

| Traditional Pool Parlour Challenge | How Cue Nation Solves It |
|---|---|
| **Timer Disputes & Client Friction** | Sessions are tracked using **immutable server-side timestamps**. If a client refreshes their screen, switches devices, or disputes elapsed minutes, the server-authoritative clock governs the bill. |
| **Double Bookings & Scheduling Gaps** | Atomic booking RPCs and slot exclusion algorithms guarantee that no table can be booked twice for overlapping timeframes. |
| **Leaked Café Revenue** | Food and drink items are linked directly to active table sessions or guest tabs via table QR codes or staff POS. Unbilled items cannot be lost upon checkout. |
| **Clunky Check-in Queues** | Customers arrive with a **unique 6-digit PIN** (`CN-XXXXXX`). Staff enter the PIN to immediately flip table lights/timers to *Running*. |
| **Static & Sub-optimal Pricing** | Built-in dynamic tariff scheduler adjusts hourly rates automatically across weekday mornings, evening prime-times, and weekend tournament hours. |

---

## 3. User Personas & Role Ecosystem

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CUE NATION ECOSYSTEM                            │
├─────────────────┬──────────────────┬─────────────────┬─────────────────┤
│    CUSTOMER     │    FLOOR STAFF   │  KITCHEN / BAR  │  OWNER / ADMIN  │
│  (Public / PWA) │  (/staff/login)  │ (/staff/kitchen)│  (/admin/login) │
├─────────────────┼──────────────────┼─────────────────┼─────────────────┤
│ • Browse tables │ • Floor grid     │ • Order queue   │ • Revenue stats │
│ • Book slots    │ • PIN check-in   │ • Prep status   │ • Dynamic tariff│
│ • 6-digit PIN   │ • Server timers  │ • Firing alerts │ • Staff accounts│
│ • QR ordering   │ • POS billing    │ • Batch ready   │ • Audit logs    │
│ • Session timer │ • Shift handover │                 │ • Memberships   │
└─────────────────┴──────────────────┴─────────────────┴─────────────────┘
```

1. **The Customer (`customer` / anonymous)**:
   - Seeks an effortless evening out with friends or competitive league practice.
   - Demands transparent pricing, real-time table availability, and easy table-side ordering without having to flag down waiters.

2. **Floor Staff (`staff` & `manager`)**:
   - Manages table turnaround, equipment handovers (cues, chalk, tournament balls), and active gameplay.
   - Needs rapid, tactile, zero-error interactions on tablets or POS screens (e.g., `+15 min`, `End Session`, `Print Bill`).

3. **Kitchen / Barista (`staff`)**:
   - Prepares artisanal coffees, gourmet burgers, and finger snacks.
   - Works from a dark-mode Kitchen Display System (KDS) showing active tickets grouped by table number and order age.

4. **Owner & Executive Manager (`owner` & `admin`)**:
   - Oversees venue profitability, labor costs, equipment wear & tear, customer membership retention, and audit trails.

---

## 4. End-to-End Operational Lifecycle

```
[1. CUSTOMER BOOKS]
Customer selects Arena (Main Pool / Smoker / Snooker) & Duration (60 / 90 / 120m)
                         │
                         ▼
[2. PIN & ID ISSUANCE]
Server atomically reserves slot, returns Ref #CN-829104 & single-use 6-Digit PIN
                         │
                         ▼
[3. ARRIVAL & CHECK-IN]
Player arrives at venue desk -> Staff inputs PIN -> Table flips to 'Running'
                         │
                         ▼
[4. IN-PLAY & CAFE ORDERING]
Server timer runs in background. Players scan Table QR code to order food & drinks.
Items fired to Kitchen Screen and appended directly to the session tab.
                         │
                         ▼
[5. EXTENSION (OPTIONAL)]
Player requests 30 extra minutes -> System validates against upcoming reservations
and recalculates tariffs automatically.
                         │
                         ▼
[6. SESSION CLOSURE & SETTLEMENT]
Staff ends session -> One unified bill generated (Time + Extras + Café + GST)
Paid via UPI QR, Cash, or Card -> Table transitions to 'Maintenance/Sanitization'.
```

---

## 5. Core Feature Breakdown by Portal

### 5.1 Public Customer Experience
* **Visual Storefront (`/`)**: High-end parlour aesthetic with ambient lighting, velvet felt textures, table showcases, amenities, and customer reviews.
* **Live Slot Reservation (`/book`, `/tables`)**:
  - Filter by arena: **Main Championship Pool**, **Smoker's Cigar Lounge Pool**, or **Tournament Snooker**.
  - Duration selectors: 60 min, 90 min, 120 min with dynamic server-calculated pricing.
  - Zero double-booking guarantee via server slot reservation logic.
* **Booking Confirmation & Digital Ticket (`/my-bookings`, `/account`)**:
  - Displays Booking Reference (`CN-XXXXXX`), table number, scheduled window, and the private **6-Digit Check-in PIN**.
  - Live session progress bar once checked in.
* **Table QR Self-Ordering (`/t/[token]`)**:
  - Cryptographically signed QR codes attached to each table allow players to order food & drinks straight to their running bill without requiring an app download.

### 5.2 Staff Floor Operations & POS (`/staff`)
* **Interactive Floor Grid (`/staff/dashboard`)**:
  - Real-time color-coded cards for every table:
    - 🟢 **Available / Free**: Ready for walk-in or booking check-in.
    - 🟡 **Booked / Upcoming**: Scheduled reservation arriving shortly.
    - 🔵 **Running / In-Play**: Active session with live elapsed clock, player name, and running spend.
    - ⚪ **Maintenance / Sanitizing**: Under cloth brushing or ball polishing.
* **Atomic PIN Check-In (`/staff/bookings`)**:
  - Rapid numerical keypad for staff to punch in customer PINs. Validates slot, associates table, and starts authoritative timer.
* **Walk-In / Offline Booking Engine**:
  - For spontaneous guests walking through the door without a prior web booking.
* **Café Point of Sale (`/staff/cafe`)**:
  - Quick-tap category layout: Artisanal Coffees, Refreshers, Bar Snacks, Gourmet Mains.
  - Add items to any active table session or standalone counter guest.
* **Consolidated Billing & Checkout (`/staff/billing`)**:
  - Automatically calculates:
    `Total = (Base Hours Rate) + (Extensions) + (Café Order Line Items) + (5% GST)`
  - Direct settlement via UPI (dynamic QR code generation), Cash, or Card.
* **Shift Handover & Daily Closing (`/staff/handover`, `/staff/closing`)**:
  - Cash drawer counting, discrepancy tracking, shift notes, and manager sign-off.
* **Live Floor Waiting List (`/staff/waiting-list`)**:
  - Digital queue management for peak Friday/Saturday night waitlists with SMS notification support.

### 5.3 Kitchen Display System (KDS) (`/staff/kitchen`)
* High-contrast dark interface built for busy barista and kitchen stations.
* Real-time audio-visual notifications for incoming tickets.
* One-click ticket status transitions: **New** ➔ **In Prep** ➔ **Ready for Table Delivery** ➔ **Served**.
* Automatic synchronization with the table's itemized bill.

### 5.4 Owner & Executive Command Centre (`/admin`)
* **Executive Performance Dashboard (`/admin/dashboard`)**:
  - Real-time gross revenue, average spend per table, peak occupancy hours, and table turn rates.
  - Interactive charts powered by Recharts comparing weekday vs. weekend performance.
* **Dynamic Pricing Engine (`/admin/pricing`)**:
  - Configure customized tariffs:
    - *Weekday Morning/Afternoon*: ₹300/hr (Pool), ₹450/hr (Snooker)
    - *Weekday Prime Evening (5 PM - 1 AM)*: ₹350/hr (Pool), ₹500/hr (Snooker)
    - *Weekend Tournament Hours*: ₹400/hr (Pool), ₹600/hr (Snooker)
* **Menu Catalog & Inventory Control (`/admin/cafe`, `/admin/inventory`)**:
  - Modify food/drink pricing, toggle item availability, and monitor pantry ingredients.
* **Memberships & Loyalty Ledgers (`/admin/memberships`)**:
  - Bronze, Silver, Gold membership tiers with recurring table discounts, complimentary coffee perks, and loyalty points.
* **Staff Access Governance (`/admin/staff`)**:
  - Provision and revoke staff credentials, monitor active logins, and assign roles (`staff` vs `manager`).
* **Equipment Maintenance Logs (`/admin/maintenance`)**:
  - Track baize cloth replacement intervals, cue tip conditioning, and slate re-leveling schedules.
* **Immutable Audit Trail (`/admin/audit-logs`)**:
  - Cryptographically tracked logs of every critical financial action: bill discounts, session cancellations, manual price overrides, and cash drawer openings.

---

## 6. Design System & "Parlour Lounge" Brand Identity

Cue Nation utilizes a custom, sophisticated aesthetic inspired by dim, lamp-lit heritage billiards parlours with polished mahogany wood, deep shadows, and rich teal felt.

### 6.1 Brand Color Palette

| Token | Swatch Name | Hex | Psychological Role |
|---|---|---|---|
| **Light Base** | Parlour Cream | `#EDDFC2` | Wall lamp warmth, clean light backgrounds |
| **Primary** | Baize Teal | `#0A5551` | The iconic English wool pool table cloth |
| **Accent** | Smoked Bronze | `#6D5330` | Polished timber rails, vintage brass lamps |
| **Dark Base** | Midnight | `#010101` | Deep parlour room shadows, sleek dark themes |
| **Glow / CTA** | Lamp Glow | `#B8925A` | Primary action buttons, active timers, highlights |
| **Success** | Teal Light | `#2FA39A` | "Available" status badge, free tables |
| **Warning** | Lamp Amber | `#D9A441` | "Booked / Arriving" indicator |
| **Danger** | Cue Red | `#A3303E` | Cancellation, alert, or expired session |

### 6.2 Typography Hierarchy
- **Headings & Display**: *Playfair Display* (Serif, 600/700 weight) — exudes club heritage, luxury, and prestige.
- **Body, Inputs & Microcopy**: *Inter* (Sans-serif, 400/500/600 weight) — crisp readability across screens.
- **Timers & Financials**: *Inter with `tabular-nums`* — ensures zero layout jitter as seconds tick down.

---

## 7. System Architecture & Tech Stack

```
                              ┌─────────────────────────────┐
                              │     Client Layer (React 19) │
                              │   Public • Staff • Admin    │
                              └──────────────┬──────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────┐
                              │  Route Security Middleware  │
                              │     (src/middleware.ts)     │
                              └──────────────┬──────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────┐
                              │ Next.js 15 App Route Layer  │
                              │  /api/bookings, /api/bills  │
                              │  /api/sessions, /api/orders │
                              └──────────────┬──────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────┐
                              │ Authoritative Core Services │
                              │ (src/lib/services/dataStore)│
                              └──────────────┬──────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────┐
                              │ Production Database Layer   │
                              │ (Supabase PostgreSQL / RLS) │
                              └─────────────────────────────┘
```

### Technology Highlights
* **Framework**: Next.js 15.1.7 (App Router with React Server Components + Client Components).
* **Core Library**: React 19.0.0.
* **Language**: TypeScript 5.7+ in strict mode.
* **Styling**: Tailwind CSS with custom theme tokens and PostCSS.
* **Icons**: Lucide React for consistent, crisp iconography.
* **Document & Receipt Generation**: `jspdf` and `jspdf-autotable` for downloadable PDF receipts; `exceljs` for owner accounting exports.
* **QR Generation & Verification**: `qrcode` library with HMAC cryptographic tokens for table-side access.
* **Security & Crypto**: Custom PBKDF2/SHA-256 password & PIN hashing algorithms (`src/lib/services/crypto.ts`).

---

## 8. Data Model & Authoritative State Engine

The platform is designed around a single source of authoritative truth in `src/lib/services/dataStore.ts` with direct schema parity to PostgreSQL / Supabase:

1. **`Pool` / `GameTable`**: Physical tables (Dimensions, Cloth specification, Arena Category, Hourly Rate, Status: `free` | `booked` | `running` | `maintenance`).
2. **`Booking`**: Customer reservation (`id`, `reference_code`, `table_id`, `customer_name`, `customer_phone`, `start_time`, `end_time`, `duration_minutes`, `status`, `hashed_pin`).
3. **`Session`**: The active floor play (`id`, `booking_id`, `table_id`, `started_at`, `expected_end_at`, `actual_end_at`, `extensions`, `is_active`).
4. **`MenuItem` & `Order`**: Café inventory (`name`, `category`, `price`, `available`) and active orders linked to table sessions (`session_id`, `items`, `status`: `pending` | `preparing` | `ready` | `served`).
5. **`Bill` & `PaymentRecord`**: Financial ledger combining time duration charges, overtime fees, café totals, taxes, and settlement status (`cash`, `upi`, `card`).
6. **`AuditLog`**: Immutable security event stream recording who did what, when, and from what IP/agent.

---

## 9. Security, Fraud-Prevention & Anti-Cheating

1. **Server-Side Price Calculation**:
   - The client never submits monetary amounts. The server re-evaluates the tariff catalog, calculates duration delta from server ISO timestamps, computes café line-totals, and stamps the bill.
2. **Brute-Force Resilient 6-Digit PINs**:
   - Check-in PINs are single-use, cryptographically hashed, and invalidated immediately upon session creation.
3. **Route & Role-Based Middleware**:
   - `/staff/*` and `/admin/*` routes are protected at the Edge by `src/middleware.ts`. Direct access without authenticated tokens automatically redirects to designated login portals.
4. **Authoritative Server Timers**:
   - Play durations are computed using `new Date() - started_at` on the server. Tampering with client local system clocks has zero effect on session length or charges.
5. **Sanitized Public Facing Footprint**:
   - Public customer pages contain zero administrative links, hidden buttons, or credential leaks.

---

## 10. Testing, Reliability & Verification

The repository includes a comprehensive, automated end-to-end testing suite:
- **`test_e2e_complete_flow.js`**: An extensive test harness executing **48 distinct assertions** covering:
  - Table retrieval and live status inspection
  - Conflict-free slot booking and PIN hashing
  - Negative testing (preventing duplicate bookings on overlapping slots)
  - Staff check-in with PIN validation
  - In-play session extensions with price adjustments
  - Café order firing, KDS status transitions, and kitchen fulfillment
  - Combined bill aggregation and multi-method payment settlements
  - Shift closing reconciliations and audit log verification

---

## 11. Current Implementation Status & Roadmap

### ✅ Completed & Live in Codebase
- [x] Full customer storefront with parlour lounge branding and responsive design
- [x] Real-time table booking engine with PIN generation (`CN-XXXXXX`)
- [x] Complete staff operations portal with interactive tabletop view
- [x] Authoritative server-calculated timers
- [x] Integrated Café POS with table order tracking
- [x] Kitchen Display System (KDS) for real-time order firing
- [x] Consolidated billing engine (Time + Extras + Café + GST)
- [x] Executive Admin dashboard with dynamic pricing controls and audit logging
- [x] 48-assertion end-to-end test suite passing with 100% green status
- [x] Middleware route protection for staff and admin surfaces

### 🚀 Upcoming Enhancements (Tier 2 Roadmap)
- [ ] Direct automated SMS/WhatsApp booking confirmation and reminder integration
- [ ] Razorpay / Stripe online prepayment gateway for peak weekend bookings
- [ ] Customer self-service table re-racking challenge and tournament bracket generator
- [ ] Hardware IoT relay integration for automated overhead table lamp on/off switching synced with the session timer

---

*Authored for Cue Nation Parlour & Lounge · Version 1.0 Commercial Operating System*
