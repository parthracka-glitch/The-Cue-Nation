# QNATION — COMPLETE FEATURE-BY-FEATURE QA, PORTAL AUDIT & END-TO-END WORKFLOW AUDIT

**Project:** QNation Pool & Snooker Management Platform  
**Target Architecture:** Exactly 6 Physical Tables (3 Pool, 3 Snooker)  
**Roles:** Principal QA Engineer, Senior Full-Stack Developer, Application Security Tester, UI/UX Auditor, Business Logic Analyst, Software Test Architect  
**Audit Date:** 2026-10-21  
**Database Status:** MongoDB **NOT YET CONNECTED OR CONFIGURED**  
**Audit Scope:** Read-Only Codebase & Runtime Inspection (Zero Source Modifications Permitted)  

---

# SECTION A — EXECUTIVE SUMMARY

### 1. Overall Project Condition
QNation is currently a **hybrid mock/client-state prototype transitioning to a production architecture**.
- The user interface across the **Customer Portal**, **Staff Portal**, and **Admin Portal** is exceptionally rich, aesthetically polished, responsive, and functional in isolated client sessions.
- **Critical Architectural Bifurcation:** The application currently maintains **two independent and unsynchronized data stores**:
  1. `venueStore` (`src/lib/store/venueStore.ts`): Client-side reactive singleton that reads and writes to browser `localStorage` (`cn_bookings`, `cn_sessions`, `cn_tables`, etc.). Used directly by the customer booking UI, live floor dashboard, timeline, waiting list, daily closing, shift handover, and memberships.
  2. `backendDataStore` (`src/lib/services/dataStore.ts`): Node.js in-memory database used by Next.js API routes (`/api/bookings`, `/api/sessions`, `/api/tables`, `/api/bills`, `/api/payments`, etc.).
- **Impact of Bifurcation:** Bookings made by customers on their mobile devices save exclusively to their device's `localStorage` and never post to the backend API. Consequently, staff members on counter tablets and administrators on desktop consoles **cannot see customer reservations in real time across different devices**.
- **MongoDB Status:** MongoDB is **completely unconfigured and absent**. There is no MongoDB driver (`mongodb` or `mongoose`) installed in `package.json`. No database connection string, Mongoose schemas, or MongoDB connection pools exist in `src/`.
- **Security Posture:** Severe access-control deficiencies exist:
  - Cookies (`cn_admin_token`, `cn_staff_token`, `cue_user_role`) are set with `httpOnly: false`.
  - Next.js middleware checks the unverified, easily forged `cue_user_role` cookie.
  - Critical endpoints (`GET /api/bookings`, `GET /api/tables`, `GET /api/sessions`) are unauthenticated and expose full customer names, phone numbers, and PIN hashes.
  - Financial endpoints (`POST /api/payments`, `POST /api/bills`, `POST /api/sessions`) default to dummy staff actors (`STAFF-FLOOR`, `STAFF-CASHIER`) when auth headers are missing, allowing unauthenticated callers to start sessions and mark bills as paid.
  - Cryptographic session signing falls back to a hardcoded static string `"cue-nation-parlour-lounge-super-secret-key-32"`.

### 2. Can the Application Be Safely Handed Over Today?
**NO.** Handing over the application in its current state would result in immediate operational failure: customer bookings made online will not appear on venue staff devices, server restarts will wipe all in-memory backend records, and unauthenticated users on the local network can inspect customer records and forge payments.

### 3. Most Urgent Next Actions
1. Install and wire the official MongoDB driver (`mongodb` or `mongoose`), replacing both `venueStore`'s `localStorage` and `backendDataStore`'s in-memory arrays with persistent MongoDB collections.
2. Unify all frontend views to query and mutate through validated backend API endpoints instead of isolated browser local storage.
3. Harden authentication: enforce `httpOnly: true`, cryptographically verify JWT/HMAC tokens in middleware, remove dummy actor fallbacks on financial endpoints, and require authentication on `GET /api/bookings` and `GET /api/sessions`.

---

# SECTION B — ENVIRONMENT AND TEST COVERAGE

### 1. Test Environment Specification
- **Operating System:** Windows 11 (NT 10.0.26100)
- **Node.js Runtime:** v22.13.0
- **Package Manager:** npm v10.9.2
- **Framework:** Next.js 15.1.7 (React 19.0.0, App Router)
- **Styling:** TailwindCSS 3.4.17
- **Test Runners:** Vitest 3.2.7, Node.js E2E Test Harness (`test_e2e_complete_flow.js`)
- **Server State:** Next.js development server active on `http://localhost:3000`

### 2. Execution Results Summary
1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - **Result:** `PASS` (0 compiler errors across 71 routes).
2. **Production Build (`npm run build`):**
   - **Result:** `PASS` (All 71 static and dynamic routes compiled and optimized).
3. **Vitest Unit & Integration Suites (`npm test`):**
   - **Result:** `PASS` (7 test files, 38/38 tests passed in 2.26s).
4. **End-to-End Script Execution (`node test_e2e_complete_flow.js`):**
   - **Result:** `FAIL` at Step 10:
     - `Assertion Failed: Bill total reconciles: ₹1181 !== ₹1125`
     - *Root Cause:* The test script asserted `finalBill.total === finalBill.time_charge + finalBill.food_charge` ($525 + 600 = 1125$) without accounting for the 5% GST tax calculation added to `finalBill.total` ($1125 + 56 = 1181$).

### 3. Categorization of Features

#### Category A — Testable Now (Evaluated in this Audit)
- All 71 Next.js page renders and layouts.
- Client-side navigation and route transitions.
- Visual touch-friendly components, table cards, modal dialogs.
- Client-side form input validation (phone format, required fields).
- Single-device local booking, PIN entry, walk-in creation, timer starts, and bill generation within `localStorage`.
- Unit test arithmetic for pricing, discounts, and duration calculation.
- Static export and compilation integrity.

#### Category B — Requires Database (Blocked / Unverified in Live Multi-Device Operations)
- Multi-device real-time persistence (Customer phone $\to$ Staff iPad $\to$ Admin PC).
- Real MongoDB transactions and atomic allocation locks.
- Concurrency protection against race conditions on the 6th table under simultaneous load.
- Crash and restart recovery of active sessions and customer bookings.
- Historical revenue retention after server restart.
- Database index uniqueness on booking codes and transaction IDs.

#### Category C — Requires External Configuration
- Live payment gateway capture (Razorpay / UPI webhook signing secrets currently set to test placeholders).
- Meta WhatsApp Business API Cloud endpoints (automated server-to-server messaging requires Meta system user access token).

---

# SECTION C — COMPLETE PAGE INVENTORY

| Route | Portal | Primary Purpose | Status | Key Findings / Issues |
|---|---|---|---|---|
| `/` | Public | Venue Landing & Hero Showcase | `PASS` | Fast, high-contrast, responsive. Links correctly to `/book`. |
| `/book` | Public | 3 Pool / 3 Snooker Slot Booking | `PARTIAL` | Generates PIN and reservation in client `localStorage` only; does not post to backend API. |
| `/booking/[bookingId]` | Public | Digital Pass & PIN Display | `PARTIAL` | Reads pass from `localStorage`. If opened on another device, pass is missing (`404`). |
| `/pricing` | Public | Rates & Pricing Packages | `PASS` | Displays Pool (₹300/₹350) and Snooker (₹450/₹500) rates. |
| `/cafe` | Public | Artisan Café Menu & Ordering | `PASS` | Displays drinks, artisanal coffee, and snacks. |
| `/contact` | Public | Venue Location & Inquiry | `PASS` | Contact form validates inputs locally. |
| `/privacy`, `/terms` | Public | Legal & Venue Policies | `PASS` | Clean, accessible static legal text. |
| `/my-bookings` | Public | Customer Past Reservations | `PARTIAL` | Relies on local Supabase client without live backend. |
| `/staff/login` | Staff | Floor Staff & Manager Auth | `PASS` | Authenticates against `backendDataStore.staffAccounts`. |
| `/staff/dashboard` | Staff | Live 6-Table Floor Grid & Timers | `PARTIAL` | Reads from `venueStore` localStorage; ignores backend server state. |
| `/staff/timeline` | Staff | 15-Hour Booking Timeline (10-01) | `PASS` (Local) | Displays 6 tables and intervals accurately in current browser. |
| `/staff/waiting-list` | Staff | Queue & Dynamic Wait Estimates | `PASS` (Local) | Wait estimator correctly calculates remaining session minutes. |
| `/staff/closing` | Staff | Cash Drawer Count & Reconciliation | `PASS` (Local) | Isolates cash from UPI/card; variance calculation verified. |
| `/staff/handover` | Staff | Outgoing/Incoming Shift Protocol | `PASS` (Local) | Dual-signatory workflow functions within local session. |
| `/staff/billing` | Staff | POS & Consolidated Checkout | `PASS` (Local) | Professional bill modal renders PDF and WhatsApp link. |
| `/staff/customers` | Staff | Player Directory & Repeat Booking | `PASS` (Local) | Aggregates local customer profiles; repeat booking button works. |
| `/staff/sessions` | Staff | Active Clocks & Timer Controls | `PASS` (Local) | Add extra time (+30/+60) and end session function locally. |
| `/staff/bookings` | Staff | Staff Booking List & PIN Verification | `PARTIAL` | PIN entry works for local bookings; remote bookings not fetched. |
| `/staff/maintenance`| Staff | Table Issue Logging & Locks | `PASS` (Local) | Conflict check warns before locking table with active reservation. |
| `/admin/login` | Admin | Owner & Executive Authentication | `PASS` | Validates admin email/password and sets admin cookies. |
| `/admin/dashboard` | Admin | Executive Venue KPI Overview | `PARTIAL` | Hardcoded metrics mixed with in-memory API data. |
| `/admin/closing` | Admin | Daily Closing Approvals & Audit | `PASS` (Local) | Allows executive review and approval of submitted shift closings. |
| `/admin/memberships`| Admin | VIP Tier Plans & Points Ledger | `PASS` (Local) | Enrolls members and adjusts points in `venueStore`. |
| `/admin/bookings` | Admin | Administrative Reservation Roster | `PARTIAL` | Fetches `/api/bookings` but misses customer bookings made in browser. |
| `/admin/sessions` | Admin | Live Frame & Session Monitor | `PARTIAL` | Fetches `/api/sessions` from in-memory backend. |
| `/admin/tables` | Admin | Table Inventory & Closures | `PARTIAL` | Confusingly calls legacy `/api/pools` alongside `/api/tables`. |
| `/admin/staff` | Admin | Staff Account Management | `PASS` | Creates staff accounts in `backendDataStore` with password hashing. |
| `/admin/pricing` | Admin | Rate & Tax Configuration | `PASS` | Updates global rates with admin role authorization. |
| `/admin/payments` | Admin | Financial Transactions & Refunds | `PASS` | Refund processing requires admin role check. |
| `/admin/reports` | Admin | Peak Hourly Load & Demand Forecast | `PASS` | Interactive Recharts graph (10 AM - 1 AM) and CSV export. |
| `/admin/audit-logs` | Admin | Immutable Security & System Logs | `PASS` | Filterable by action, actor role, and resource. |
| `/admin/settings` | Admin | Operating Hours & Venue Metadata | `PASS` | Updates venue settings in server memory. |

---

# SECTION D — INDIVIDUAL FEATURE & CONTROL CHECKLIST

| ID | Portal/Page | Feature or Control | Status | Evidence | Identified Issue / Risk |
|---|---|---|---|---|---|
| CTL-01 | Public `/book` | Game Type Toggle (Pool/Snooker) | `PASS` | `src/app/book/page.tsx:106` | Switches rates and slot sets cleanly. |
| CTL-02 | Public `/book` | Date Selector Tabs (0-3 days) | `PASS` | `src/app/book/page.tsx:397` | Computes correct date offsets and re-generates slots. |
| CTL-03 | Public `/book` | Duration Selector (1h, 2h, 3h) | `PASS` | `src/app/book/page.tsx:429` | Recomputes totals proportionally. |
| CTL-04 | Public `/book` | Slot Grid Capacity Badge | `PASS` | `src/app/book/page.tsx:482` | Displays "X/3 Free", "1 Table Left!", or "Sold Out". |
| CTL-05 | Public `/book` | Guest Form Validation | `PASS` | `src/app/book/page.tsx:121` | Enforces non-empty name and 10-digit mobile number. |
| CTL-06 | Public `/book` | Confirm & Generate PIN Button | `FAIL` | `src/app/book/page.tsx:141` | Calls `venueStore.createBooking` locally; **never sends HTTP request to `/api/bookings`**. |
| CTL-07 | Public `/book` | PIN Copy to Clipboard | `PASS` | `src/app/book/page.tsx:172` | Copies PIN to clipboard with feedback animation. |
| CTL-08 | Public `/booking/[id]` | Digital Pass Retrieval | `FAIL` | `src/app/booking/[bookingId]/page.tsx:28` | Fails with 404 if accessed from any device other than the booking machine. |
| CTL-09 | Staff `/staff` | Quick PIN Check-in Input | `PARTIAL` | `src/app/staff/page.tsx:135` | Validates PIN against `venueStore.bookings`; cannot validate remote online bookings. |
| CTL-10 | Staff `/staff` | Walk-in Modal Form | `PASS` | `src/app/staff/page.tsx:240` | Auto-allocates an available table of the chosen game type. |
| CTL-11 | Staff `/staff` | Timer Controls (+30m, +60m) | `PASS` | `src/app/staff/page.tsx:151` | Prorates charges correctly (₹150 for pool, ₹225 for snooker). |
| CTL-12 | Staff `/staff` | End Session Button | `PASS` | `src/app/staff/page.tsx:166` | Marks table free, locks elapsed time, opens bill modal. |
| CTL-13 | Staff `/staff/timeline` | 15-Hour Grid Render | `PASS` | `src/app/staff/timeline/page.tsx:110` | Correctly positions 10:00 to 01:00 blocks across all 6 tables. |
| CTL-14 | Staff `/staff/waiting-list` | Add to Queue Button | `PASS` | `src/app/staff/waiting-list/page.tsx:64` | Adds customer to queue with party size and game type. |
| CTL-15 | Staff `/staff/waiting-list` | Dynamic Wait Calculator | `PASS` | `src/lib/store/venueStore.ts:1010` | Finds lowest remaining time on active sessions of that game. |
| CTL-16 | Staff `/staff/waiting-list` | Notify via WhatsApp Button | `PASS` | `src/app/staff/waiting-list/page.tsx:78` | Generates formatted `https://wa.me/` URI with customer name. |
| CTL-17 | Staff `/staff/waiting-list` | Seat Player Action | `PASS` | `src/app/staff/waiting-list/page.tsx:89` | Allocates free table and starts session immediately. |
| CTL-18 | Staff `/staff/closing` | Cash Drawer Input & Variance | `PASS` | `src/app/staff/closing/page.tsx:85` | Accurately calculates Surplus (+), Shortage (-), or Balanced. |
| CTL-19 | Staff `/staff/handover` | Outgoing Handover Submit | `PASS` | `src/app/staff/handover/page.tsx:75` | Captures open tables, unpaid bills, and drawer cash. |
| CTL-20 | Staff `/staff/handover` | Inbound Acknowledge Button | `PASS` | `src/app/staff/handover/page.tsx:98` | Records incoming staff signature and timestamp. |
| CTL-21 | Staff `/staff/billing` | Professional Bill Modal | `PASS` | `src/components/billing/ProfessionalBillModal.tsx` | Calculates time, café, tax, and net payable without float errors. |
| CTL-22 | Staff `/staff/billing` | Download A4 PDF Button | `PASS` | `src/components/billing/ProfessionalBillModal.tsx:180` | Generates clean, printable receipt via browser print API. |
| CTL-23 | Staff `/staff/billing` | Share on WhatsApp Button | `PASS` | `src/components/billing/ProfessionalBillModal.tsx:210` | Opens WhatsApp Web with pre-formatted invoice breakdown. |
| CTL-24 | Staff `/staff/customers` | Repeat Booking Button | `PASS` | `src/app/staff/customers/page.tsx:153` | Pre-fills customer name & phone in walk-in creator. |
| CTL-25 | Staff `/staff/maintenance`| Report Issue Form | `PASS` | `src/app/staff/maintenance/page.tsx:51` | Flags maintenance severity (low, medium, high, critical). |
| CTL-26 | Staff `/staff/maintenance`| Conflict Pre-Flight Alert | `PASS` | `src/app/staff/maintenance/page.tsx:58` | Prompts browser confirmation when reservation conflicts exist. |
| CTL-27 | Staff Nav | Tablet Mode Toggle | `PASS` | `src/components/staff/StaffNav.tsx:43` | Toggles high-contrast, touch-optimized kiosk layout. |
| CTL-28 | Admin `/admin/closing` | Closing Review & Approve | `PASS` | `src/app/admin/closing/page.tsx:80` | Updates closing status from `submitted` to `approved`. |
| CTL-29 | Admin `/admin/memberships`| Enroll Member Modal | `PASS` | `src/app/admin/memberships/page.tsx:64` | Enrolls player into Silver/Gold/Platinum with welcome points. |
| CTL-30 | Admin `/admin/memberships`| Adjust Points Modal | `PASS` | `src/app/admin/memberships/page.tsx:85` | Adds bonus or redeems points in reward ledger. |
| CTL-31 | Admin `/admin/reports` | Hourly Demand Recharts | `PASS` | `src/app/admin/reports/page.tsx:185` | Renders dual-series bar chart for Pool vs Snooker occupancy. |
| CTL-32 | Admin `/admin/reports` | Export Financial CSV | `PASS` | `src/app/admin/reports/page.tsx:107` | Downloads well-formed CSV file in browser. |
| CTL-33 | Admin `/admin/staff` | Create Staff Account | `PASS` | `src/app/admin/staff/page.tsx:90` | Hashes password with OWASP-approved `scrypt` salt. |
| CTL-34 | Admin `/admin/pricing` | Update Base Rates | `PASS` | `src/app/admin/pricing/page.tsx:75` | Persists rate changes; requires admin role token. |
| CTL-35 | Admin `/admin/audit-logs` | Filter by Action/Role | `PASS` | `src/app/admin/audit-logs/page.tsx:45` | Filters audit events in real time. |
| CTL-36 | API `/api/bookings` | GET Request (Public) | `FAIL` | `src/app/api/bookings/route.ts:5` | **Unauthenticated leak:** Returns all customer bookings, phones, emails. |
| CTL-37 | API `/api/payments` | POST (pay_at_venue) | `FAIL` | `src/app/api/payments/route.ts:28` | **Unauthenticated write:** Defaults to `STAFF-FLOOR` if auth header missing. |
| CTL-38 | API `/api/bills` | POST (pay bill) | `FAIL` | `src/app/api/bills/route.ts:40` | **Unauthenticated write:** Defaults to `STAFF-CASHIER` if auth header missing. |

---

# SECTION E — END-TO-END WORKFLOW RESULTS

### Workflow A: Online Booking
- **Trace:** Customer visits `/book` $\to$ selects discipline (Pool or Snooker) $\to$ selects date/slot $\to$ enters name & phone $\to$ confirms booking $\to$ receives 6-digit PIN.
- **Observed Result:** Booking succeeds instantly in the customer's browser, emitting celebratory confetti and displaying the confidential PIN.
- **Persistence Limitation:** The booking is committed **only to `localStorage` (`cn_bookings`)**. No HTTP request is dispatched to `/api/bookings`.
- **Verdict:** `PARTIAL` (Works locally; fails cross-device synchronization).

### Workflow B: Online Payment Flow
- **Trace:** Customer selects "Online Prepay" on `/book` $\to$ initiates payment $\to$ provider webhook verifies signature $\to$ booking marked confirmed.
- **Observed Result:** Razorpay mock checkout session is initiated by `/api/payments`. Signature verification helper exists in `src/lib/services/paymentService.ts`.
- **Persistence Limitation:** Webhook processing modifies `backendDataStore.payments` in memory. In-memory state is lost on server reboot.
- **Verdict:** `PARTIAL` (Logic sound; persistence and production webhook secrets unconfigured).

### Workflow C: Customer Arrives with PIN
- **Trace:** Staff opens `/staff` $\to$ enters 6-digit PIN $\to$ system validates PIN $\to$ assigns free table $\to$ starts timer clock.
- **Observed Result:** If the booking exists in the local store, PIN validation succeeds, table status flips from `free` to `running`, and live timer starts.
- **Defect:** If customer booked on their own phone, staff's browser does not have the booking in its `localStorage`, resulting in: *"Invalid PIN or reservation not found"*.
- **Verdict:** `PARTIAL` (Blocked by cross-device persistence).

### Workflow D: Walk-In Customer
- **Trace:** Staff clicks "New Walk-in Game" $\to$ selects Pool or Snooker $\to$ selects duration $\to$ system auto-allocates an available table of that discipline $\to$ starts session immediately.
- **Observed Result:** `venueStore.autoAllocateTable` correctly inspects the 3 physical tables of the chosen game. If free, it starts the session. If all 3 tables are occupied, it alerts staff and offers the waiting list.
- **Verdict:** `PASS`.

### Workflow E: Session Extension
- **Trace:** Staff clicks "+30 Min" or "+60 Min" on active table $\to$ availability checked $\to$ timer extended $\to$ time charge recalculated.
- **Observed Result:** Extra minutes update cleanly. Proration formula applies correct rates (Pool: ₹300/hr $\implies$ ₹150 for 30m; Snooker: ₹450/hr $\implies$ ₹225 for 30m).
- **Verdict:** `PASS`.

### Workflow F: Session Completion & Billing
- **Trace:** Staff clicks "End Session" $\to$ table flips to `free` $\to$ consolidated bill modal opens $\to$ staff records Cash/UPI/Card payment $\to$ staff downloads PDF or sends WhatsApp message.
- **Observed Result:** Bill calculated server-side/store-side. Minor unit integer rounding prevents floating point anomalies. Reopening or reprinting the bill is idempotent.
- **Verdict:** `PASS`.

### Workflow G: Daily Closing & Cash Reconciliation
- **Trace:** End of day $\to$ staff opens `/staff/closing` $\to$ reviews Cash, UPI, Card totals $\to$ enters physical cash counted in drawer $\to$ system flags variance $\to$ submits report $\to$ admin reviews on `/admin/closing`.
- **Observed Result:** Physical cash is strictly separated from digital collections. Declaring less cash than expected flags a shortage discrepancy. Admin approval workflow functions.
- **Verdict:** `PASS` (Local session).

### Workflow H: Maintenance & Scheduling Conflicts
- **Trace:** Staff/Admin schedules maintenance on a table $\to$ system checks time window against existing reservations $\to$ displays conflict warning if booked $\to$ locks table if confirmed.
- **Observed Result:** `venueStore.checkMaintenanceConflict` correctly detects overlaps and alerts the operator with conflicting booking reference numbers before taking the table offline.
- **Verdict:** `PASS`.

### Workflow I: Customer History & Repeat Bookings
- **Trace:** Staff searches customer on `/staff/customers` $\to$ previous booking count and spend displayed $\to$ staff clicks "Repeat" $\to$ opens walk-in dialog with pre-filled customer details.
- **Observed Result:** Instant repeat booking workflow functions cleanly.
- **Verdict:** `PASS`.

### Workflow J: Shift Handover
- **Trace:** Outgoing staff logs drawer cash and operational notes on `/staff/handover` $\to$ incoming staff reviews open tables and pending bills $\to$ enters name to acknowledge.
- **Observed Result:** Dual-signatory handover log created with immutable timestamp.
- **Verdict:** `PASS`.

### Workflow K: VIP Memberships & Loyalty
- **Trace:** Admin enrolls customer on `/admin/memberships` $\to$ Silver/Gold/Platinum plan assigned $\to$ welcome bonus credited to reward ledger $\to$ points adjusted on request.
- **Observed Result:** Ledger records credits and redemptions with audit notes.
- **Verdict:** `PASS`.

---

# SECTION F — BOOKING & TABLE ALLOCATION AUDIT

### 1. Physical Inventory Verification
The venue models exactly **6 physical competition tables**:
- 3 Pool tables: `pool-1`, `pool-2`, `pool-3` (9ft Tournament Slate)
- 3 Snooker tables: `snooker-1`, `snooker-2`, `snooker-3` (12ft Championship Strachan)
- **Status:** Verified in `INITIAL_TABLES` in both `venueStore.ts` and `dataStore.ts`.
- **Legacy Artifact Finding:** `dataStore.ts` still contains a legacy `INITIAL_POOLS` array with `main-pool` and `smoker-pool`. Legacy endpoints `/api/pools` expose these old IDs, creating potential confusion if third-party integrations call `/api/pools` instead of `/api/tables`.

### 2. Allocation & Interval Overlap Rules
- Overlap detection uses half-open interval comparison `[start, end)`:
  $$\text{Overlap} \iff (\text{existingStart} < \text{requestedEnd}) \land (\text{existingEnd} > \text{requestedStart})$$
- Verified in `bookingConflict.test.ts` (6/6 tests passed) and `venueStore.findAvailableTableForSlot`.
- **Discipline Enforcement:** Strict separation is enforced. Pool bookings are restricted to `pool-1..3`; Snooker bookings are restricted to `snooker-1..3`.

### 3. Concurrency Protection Evaluation
- In the current development stage, concurrency is managed via single-threaded in-memory JavaScript execution.
- **MongoDB Concurrency Risk:** Because MongoDB has not been connected, real database-level concurrency controls (atomic `$set` with condition queries, unique compound sparse indexes, or MongoDB ACID transactions) are **not yet active**.
- **Assessment:** Concurrency protection is `BLOCKED — DATABASE`. Two simultaneous HTTP requests to `/api/bookings` in a clustered multi-instance deployment could double-book the final table until MongoDB unique indexing is deployed.

---

# SECTION G — BILLING & FINANCIAL INTEGRITY AUDIT

### 1. Pricing & Rounding Accuracy
- Rates are configured server-side: Pool = ₹300-₹350/hr, Snooker = ₹450-₹500/hr.
- Time proration applies:
  $$\text{Charge} = \left\lceil \frac{\text{Duration Minutes}}{60} \times \text{Hourly Rate} \right\rceil$$
- Tax calculation: 5% GST is computed via `Math.round(subtotal * 0.05)`.
- **Minor Unit Precision:** All monetary amounts are handled in whole integers (INR), eliminating IEEE 754 floating-point rounding errors.

### 2. Bill Numbering & Idempotency
- Bill format: `QN-YYYY-XXXXX` (e.g., `QN-2026-00001`).
- `venueStore.endSession` checks if an existing bill exists for `session_id`. If so, it returns the existing bill rather than creating a duplicate.
- Re-printing or viewing the bill modal does not alter financial balances.

### 3. Discrepancy Found in Automated Test Suite
- In `test_e2e_complete_flow.js` line 215:
  `assert(finalBill.total === finalBill.time_charge + finalBill.food_charge)`
  The test script expected ₹1125 ($525 + 600$), but the server returned ₹1181 because 5% GST (₹56) was included.
  *Finding:* The test assertion is out of sync with the application's tax engine.

---

# SECTION H — SECURITY & PERMISSIONS AUDIT

### 1. Critical Vulnerabilities & Deficiencies

#### SEC-01: Unauthenticated Leak of Customer Data (`GET /api/bookings`)
- **File:** [`src/app/api/bookings/route.ts:5-33`](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/1/CUE-NATION-main/src/app/api/bookings/route.ts)
- **Vulnerability:** `GET /api/bookings` does not check credentials or session tokens.
- **Impact:** Any unauthenticated visitor or scraper sending `GET http://localhost:3000/api/bookings` receives the full JSON list of customer bookings, including guest full names, mobile phone numbers, email addresses, and PIN hashes.
- **Severity:** `P0 — CRITICAL`.

#### SEC-02: Unauthenticated Leak of Player Details on Table Status (`GET /api/tables`)
- **File:** [`src/app/api/tables/route.ts:8-25`](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/1/CUE-NATION-main/src/app/api/tables/route.ts)
- **Vulnerability:** `GET /api/tables` populates `runningSession` and `activeBooking` without auth.
- **Impact:** An attacker querying table status can see who is currently playing at every table, along with their private phone number.
- **Severity:** `P0 — CRITICAL`.

#### SEC-03: Unauthenticated Financial & Session Modifications
- **Files:**
  - [`src/app/api/payments/route.ts:28-33`](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/1/CUE-NATION-main/src/app/api/payments/route.ts)
  - [`src/app/api/bills/route.ts:40-45`](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/1/CUE-NATION-main/src/app/api/bills/route.ts)
  - [`src/app/api/sessions/route.ts:22-27`](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/1/CUE-NATION-main/src/app/api/sessions/route.ts)
- **Vulnerability:** If the `Authorization` header is missing, these routes default to fallback mock identities (`STAFF-FLOOR`, `STAFF-CASHIER`).
- **Impact:** An unauthenticated user can mark bills as paid, record cash receipts, and start/end sessions without staff credentials.
- **Severity:** `P0 — CRITICAL`.

#### SEC-04: Non-HttpOnly Cookies & Middleware Role Spoofing
- **Files:**
  - [`src/app/api/auth/login/route.ts:24-35, 49-60`](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/1/CUE-NATION-main/src/app/api/auth/login/route.ts)
  - [`src/middleware.ts:12-24`](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/1/CUE-NATION-main/src/middleware.ts)
- **Vulnerability:** Cookies `cn_admin_token`, `cn_staff_token`, and `cue_user_role` are set with `httpOnly: false`. In `middleware.ts`, access to `/admin` routes is granted if `roleCookie === "owner" || roleCookie === "admin"`.
- **Impact:** Because `cue_user_role` is readable and writable by JavaScript, an attacker can execute `document.cookie = "cue_user_role=owner"` in their browser console and bypass the Next.js middleware guard to view admin pages.
- **Severity:** `P1 — HIGH`.

#### SEC-05: Hardcoded HMAC Secret Key Fallback
- **File:** [`src/lib/services/crypto.ts:3`](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/1/CUE-NATION-main/src/lib/services/crypto.ts)
- **Vulnerability:** `const SECRET_SALT_KEY = process.env.QR_SIGNING_KEY || "cue-nation-parlour-lounge-super-secret-key-32";`
- **Impact:** If `QR_SIGNING_KEY` is undefined in the environment, session tokens are signed with this public string, allowing token forgery.
- **Severity:** `P1 — HIGH`.

---

# SECTION I — UI/UX, ACCESSIBILITY & RESPONSIVENESS

### 1. Usability Highlights
- **Design Aesthetic:** Excellent dark luxury theme (deep midnight slate `#0B1312`, rich baize green `#1B4D3E`, brushed brass `#C5A059`, and warm parchment cream `#FDFBF7`).
- **Status Communication:** Table status uses both color and explicit textual labels (`Available`, `Booked`, `Running`, `Maintenance`), satisfying WCAG non-color-dependent requirements.
- **Tablet Kiosk Mode:** Top header switch increases button dimensions to $\ge 48\text{px}$, optimized for finger taps on counter tablets.

### 2. Functional Usability Findings
- **DEF-UI-01:** On `/book`, after selecting a slot, pressing the browser's native Back button navigates completely off the booking page rather than returning to Step 2 (Date & Slot). *Workaround present:* The page includes an in-app "Previous Step" button.
- **DEF-UI-02:** On `/staff/timeline`, the horizontal 15-hour schedule scrollbar can be difficult to drag on trackpads without touch swiping. Adding chevron scroll buttons (`<` and `>`) would improve desktop usability.
- **DEF-UI-03:** In `/admin/tables`, editing a table shows inputs for opening time and hourly rate, but submitting changes calls `/api/pools` which targets the legacy pool model rather than `GameTable`.

---

# SECTION J — MISSING FEATURES (VS BLOCKED FEATURES)

### 1. Truly Missing Functionality
1. **Automated WhatsApp Business Webhook Handlers:**
   - Click-to-chat links are fully functional (`https://wa.me/...`). However, an inbound webhook receiver to track message statuses (`queued`, `sent`, `delivered`, `read`) is not implemented.
2. **Customer Self-Service Cancellation:**
   - Customers receive their booking code and PIN, but cannot cancel or reschedule their own booking online without contacting venue staff.
3. **Database Migration / Schema Provisioning Tool:**
   - No Mongoose schema migration or collection index setup script exists to provision MongoDB collections from the TypeScript interfaces in `src/types/database.ts`.

### 2. Blocked Features (Awaiting MongoDB Integration)
- Multi-client booking synchronization between customer phones and staff terminals.
- Server reboot session recovery.
- Atomic table allocation concurrency under simultaneous race conditions.
- Historical revenue and closing report permanence.

---

# SECTION K — PRIORITIZED DEFECT BACKLOG

| ID | Priority | Problem Summary | Business / Security Impact | File / Evidence | Recommended Next Action |
|---|---|---|---|---|---|
| **DEF-01** | `P0` | **Client/Server Store Split** | Customer bookings made on `/book` save only to client localStorage; venue staff never see them. | `src/app/book/page.tsx:141` | Rewrite `handleConfirmBooking` on `/book` to invoke `POST /api/bookings`. |
| **DEF-02** | `P0` | **Customer Data Exposure on API** | Unauthenticated `GET /api/bookings` returns full customer names, phone numbers, and PIN hashes. | `src/app/api/bookings/route.ts:5` | Require `authenticateRequest` in `GET /api/bookings` and sanitize customer fields. |
| **DEF-03** | `P0` | **Player Identity Exposure on Tables API** | Unauthenticated `GET /api/tables` returns active player's name and private phone number. | `src/app/api/tables/route.ts:13` | Strip `guest_phone`, `guest_email`, and `pin_hash` from public table endpoint. |
| **DEF-04** | `P0` | **Unauthenticated Payment / Bill Settlement** | Missing auth headers default to mock cashier, allowing unauthenticated bill settlement. | `src/app/api/bills/route.ts:40`, `payments/route.ts:28` | Return HTTP 401 Unauthorized if `authenticateRequest(authHeader)` returns null. |
| **DEF-05** | `P1` | **Client-Forgable Role Cookie in Middleware** | `cue_user_role` cookie is non-HttpOnly; setting it to `owner` in console bypasses `/admin` guard. | `src/middleware.ts:18`, `src/app/api/auth/login/route.ts:24` | Set `httpOnly: true` on auth cookies and verify JWT signature inside `middleware.ts`. |
| **DEF-06** | `P1` | **Hardcoded HMAC Secret Key Fallback** | `SECRET_SALT_KEY` falls back to a static string if `QR_SIGNING_KEY` is unset. | `src/lib/services/crypto.ts:3` | Throw an error at startup if `QR_SIGNING_KEY` or `JWT_SECRET` is missing. |
| **DEF-07** | `P1` | **Missing MongoDB Driver & Persistence** | No database package installed; in-memory backend wipes all records on process restart. | `package.json:13`, `src/lib/services/dataStore.ts` | Install `mongoose` or `mongodb` and create persistent models for the 6 tables, bookings, bills. |
| **DEF-08** | `P2` | **E2E Test Assertion Tax Discrepancy** | `test_e2e_complete_flow.js` fails at step 10 because assertion ignores 5% GST tax in `bill.total`. | `test_e2e_complete_flow.js:215` | Update test assertion to account for `tax_amount` in `bill.total`. |
| **DEF-09** | `P2` | **Legacy Pool Endpoints vs 6 Physical Tables** | `/api/pools` exposes old `main-pool` and `smoker-pool` while venue operates 6 physical tables. | `src/app/api/pools/route.ts:8`, `dataStore.ts:47` | Deprecate `/api/pools` in favor of `/api/tables` covering `pool-1..3` and `snooker-1..3`. |
| **DEF-10** | `P3` | **In-App Pass 404 Across Devices** | Viewing `/booking/[id]` on another device fails because pass looks only in local storage. | `src/app/booking/[bookingId]/page.tsx:28` | Fetch booking pass from `/api/bookings/[id]` instead of local storage. |

---

# SECTION L — DATABASE CONNECTION READINESS

### 1. Current State of Database Integration
- **Driver Status:** Neither `mongodb` nor `mongoose` is listed in `package.json`.
- **Connection Logic:** No `connectToDatabase` or `mongoose.connect` utility exists in the repository.
- **Existing Schemas:** Comprehensive TypeScript domain types exist in [`src/types/database.ts`](file:///c:/Users/Parth%20Racka/OneDrive/Desktop/1/CUE-NATION-main/src/types/database.ts), covering `GameTable`, `Booking`, `Session`, `Bill`, `PaymentRecord`, `ShiftHandover`, `DailyClosing`, `MembershipPlan`, and `CustomerMembership`. These types are fully prepared to be converted into Mongoose schemas or MongoDB collection schemas.

### 2. Environment Variables Required for MongoDB Integration
Based on architectural inspection, the following variables must be configured in `.env.local`:
```bash
# Required Database Connection String
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/qnation?retryWrites=true&w=majority"
MONGODB_DB_NAME="qnation"

# Required Cryptographic Secrets (Do not use default fallbacks)
QR_SIGNING_KEY="<generate_64_character_random_hex_key>"
JWT_SECRET="<generate_64_character_random_hex_key>"
```

### 3. Critical Checks Required After MongoDB Is Configured
1. **Compound Unique Index on Bookings:**
   Ensure a sparse or conditional index is created to prevent overlapping table allocations:
   ```javascript
   db.bookings.createIndex(
     { table_id: 1, "during.start": 1, "during.end": 1 },
     { unique: false }
   );
   ```
2. **Atomic Table Check-In:**
   Use atomic `$set` operations with condition guards:
   ```javascript
   db.tables.updateOne(
     { _id: tableId, status: "free" },
     { $set: { status: "running", current_session_id: sessionId } }
   );
   ```
3. **Idempotent Inventory Initialization:**
   Ensure the database connection script checks if tables exist before seeding, preventing duplicate tables on server restarts:
   ```javascript
   const count = await db.collection("tables").countDocuments();
   if (count === 0) { await db.collection("tables").insertMany(INITIAL_TABLES); }
   ```

---

# SECTION M — RECOMMENDED FIXING SEQUENCE

For the upcoming development task, execute modifications in this exact order:

```
[Phase 1: Security & Auth Hardening]
  ├── Fix SEC-01 & SEC-02: Authenticate & sanitize GET /api/bookings and GET /api/tables
  ├── Fix SEC-03: Remove fallback dummy actors on POST /api/payments, bills, sessions (enforce 401)
  ├── Fix SEC-04: Set cookies httpOnly: true, sameSite: strict, secure: true
  └── Fix SEC-05: Enforce non-empty QR_SIGNING_KEY / JWT_SECRET environment variables

[Phase 2: Database Driver & Persistence Setup]
  ├── Install mongodb or mongoose in package.json
  ├── Create database connection singleton with connection pooling (src/lib/db/mongodb.ts)
  ├── Create MongoDB collection adapters matching src/types/database.ts
  └── Create idempotent collection seeding script (ensuring exactly 6 tables)

[Phase 3: Client-Server API Synchronization]
  ├── Update src/app/book/page.tsx to dispatch POST /api/bookings upon confirmation
  ├── Update src/app/booking/[bookingId]/page.tsx to fetch pass from GET /api/bookings/[id]
  └── Connect venueStore to poll / subscribe to backend API changes

[Phase 4: Table Allocation & Concurrency Verification]
  ├── Implement atomic allocation guards in MongoDB queries
  ├── Verify half-open interval overlap [start, end) at database query level
  └── Remove legacy INITIAL_POOLS references from /api/pools

[Phase 5: Financial & Test Suite Synchronization]
  ├── Synchronize test_e2e_complete_flow.js assertion to account for 5% GST in finalBill.total
  └── Run full E2E test harness to verify complete pass across Customer, Staff, and Admin flows
```

---

# SECTION N — FINAL GO-LIVE VERDICT

## **VERDICT: NOT READY**

### Evidence-Based Rationale:
1. **No Persistent Database:** MongoDB is not connected or installed. All backend state resides in transient Node.js memory, which wipes on every server restart.
2. **Client-Server Disconnect:** Customer bookings made on `/book` are saved exclusively to the customer's browser `localStorage` and never transmit to venue staff terminals.
3. **P0 Security Vulnerabilities:** Unauthenticated endpoints leak customer telephone numbers and allow unauthorized callers to trigger bill settlements and session creations.
4. **Middleware Bypass:** Authentication cookies are non-HttpOnly and role authorization in middleware relies on an unsigned client cookie that can be spoofed in the browser console.

The application has an outstanding user interface, sound pricing arithmetic, and well-designed domain models, but it requires the implementation of the recommended Phase 1–5 remediation sequence before operational handover to the venue client.
