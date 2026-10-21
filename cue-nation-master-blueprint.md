# 🎱 CUE NATION — Master Blueprint
**Brand Kit · Architecture · Live-Sync Engine · Staged Build · Security · Testing · Launch Runbook**

> Version 1.0 · Venue: Pool / Snooker hall + in-house café · Timezone: `Asia/Kolkata` · Currency: INR (₹)
> One platform for **Customers** (website + booking), **Staff** (live floor + POS) and **Owner** (analytics + full control).

---

## Table of Contents
1. [Reality Check & Launch Strategy](#1-reality-check--launch-strategy)
2. [Product Overview](#2-product-overview)
3. [Brand Kit](#3-brand-kit)
4. [Design System & UI Specs](#4-design-system--ui-specs)
5. [Architecture](#5-architecture)
6. [Project Structure](#6-project-structure)
7. [Database Schema (Production SQL)](#7-database-schema-production-sql)
8. [Live Sync Engine](#8-live-sync-engine)
9. [Feature Specifications](#9-feature-specifications)
10. [Staged Build Plan](#10-staged-build-plan)
11. [Security & Cyber-Attack Hardening](#11-security--cyber-attack-hardening)
12. [Testing Strategy](#12-testing-strategy)
13. [Dead Code & Dead File Elimination](#13-dead-code--dead-file-elimination)
14. [CI/CD & Deployment](#14-cicd--deployment)
15. [Launch-Day Runbook](#15-launch-day-runbook)
16. [Edge Cases Register](#16-edge-cases-register)
17. [Post-Launch Roadmap](#17-post-launch-roadmap)
18. [Definition of Done](#18-definition-of-done)

---

## 1. Reality Check & Launch Strategy

Launching a booking + POS + analytics platform in one day is only possible with a **ruthless cut line**. This blueprint therefore defines two tiers. Do not ship Tier 2 items on launch day if Tier 1 is not 100% verified.

### Tier 1 — "Launch Day" (must be live, must be flawless)
| # | Capability | Why it can't wait |
|---|---|---|
| 1 | Public site (hero, tables, café, about) | The storefront |
| 2 | Google + email auth, profile | Identity for bookings |
| 3 | Booking flow with **live availability sync** and **zero double-booking** | Core promise |
| 4 | Booking ID + PIN confirmation | Check-in mechanism |
| 5 | Staff floor: PIN → table → timer, extra time, end session | Daily operations |
| 6 | Offline (walk-in) bookings | Staff reality |
| 7 | Combined bill + mark paid | Revenue capture |
| 8 | Security baseline (§11) + critical tests (§12) | Non-negotiable |

### Tier 2 — "Week 1" (ship behind feature flags once Tier 1 is stable)
QR menu ordering + kitchen screen · Owner analytics, calendar, expenses · PDF/Excel export · CMS-style website editing · WhatsApp/SMS reminders · Online payments.

> **Go/No-Go rule:** If any Tier 1 item fails its Done-when checklist at the 6 PM gate (§15), launch is postponed, not patched live. A booking system that double-books or leaks data on day one costs more trust than a one-day delay.

### Realistic effort
The staged plan below totals ~5 working days for one developer. For a next-day launch you need either a team working stages in parallel (§10.0 shows the split) or acceptance that Tier 1 is the launch and Tier 2 follows during the week.

---

## 2. Product Overview

| Item | Detail |
|---|---|
| Product | Booking + Table Timer + Café POS + Owner Analytics |
| Users | Customer · Staff · Owner (role-based access) |
| Core promise | Book online → arrive with PIN → timer starts → order from table QR → one auto-calculated bill |

### 2.1 Roles & Permissions Matrix

| Capability | Anonymous | Customer | Staff | Owner |
|---|:-:|:-:|:-:|:-:|
| View pricing & live availability | ✅ | ✅ | ✅ | ✅ |
| Book a table | ❌ | ✅ | ✅ (offline) | ✅ |
| View own bookings / PIN / timer | ❌ | ✅ (own only) | — | — |
| Order via table QR | ✅ (signed QR token) | ✅ | — | — |
| Start session with PIN | ❌ | ❌ | ✅ | ✅ |
| Add extra time, end session | ❌ | ❌ | ✅ | ✅ |
| Manage all bookings | ❌ | ❌ | ✅ | ✅ |
| Manage menu | ❌ | ❌ | ✅ | ✅ |
| Kitchen screen | ❌ | ❌ | ✅ | ✅ |
| Expenses, reports, export | ❌ | ❌ | ❌ | ✅ |
| Edit site content, pricing, staff accounts | ❌ | ❌ | ❌ | ✅ |

### 2.2 End-to-End Flow

```
CUSTOMER                         SYSTEM / REALTIME                    STAFF                OWNER
────────                         ─────────────────                    ─────                ─────
Login (Google/email)
  ↓
Browse tables & pricing ◄──────── live availability (Realtime) ────────────────────────────────
  ↓
Pick table → date → slot
  ↓
Confirm ─────────────────────────► create_booking() RPC (atomic)
  ↓                                 • exclusion constraint blocks overlap
Booking ID + PIN shown              • booked_slots row broadcast ──► every open browser updates
  ↓
Arrives at venue ────────────────────────────────────────────────────► enters PIN
                                    start_session() RPC ◄──────────── table allotted
                                    started_at = server now()
Timer visible in profile ◄──────── same started_at ─────────────────► Timer on floor
  ↓
Scans table QR → orders ─────────► order row ──► kitchen screen + staff view
  ↓                                 served items auto-added to bill
Extra time? ─────────────────────────────────────────────────────────► add minutes
  ↓                                 overlap check vs next booking
Session ends → combined bill ───► bills row (time + extra + food)
                                    mark paid (cash/UPI/card) ───────────────────► Reports & charts
```

---

## 3. Brand Kit

### 3.1 Brand Essence
| Attribute | Definition |
|---|---|
| Name | **Cue Nation** |
| Tagline | *"Own the Table."* |
| Secondary taglines | *"Rack. Break. Repeat."* · *"Where every shot counts."* |
| Positioning | A premium-but-welcoming cue club: serious tables, serious coffee, zero friction booking |
| Personality | Confident · Refined · Social · Precise |
| Voice | Short sentences. Active verbs. Warm, never corporate. A little wit, never slang overload. |
| Audience | Students & young professionals (18–35), friend groups, league players, casual café visitors |

### 3.2 Voice & Tone Guide
| Context | Do | Don't |
|---|---|---|
| Booking success | "You're in. Table 3, Friday 7 PM. Show this PIN at the desk." | "Your transaction has been processed." |
| Error | "That slot just got taken. Here are the nearest ones." | "Error 409: Conflict." |
| Empty state | "No bookings yet. Your first rack is waiting." | "No data." |
| Staff UI | Terse, imperative: "Start", "+15 min", "End" | Long sentences |
| Legal / payments | Plain, exact, friendly | Jargon |

### 3.3 Logo System
- **Primary mark:** Wordmark `CUE NATION` in Playfair Display Bold, letter-spacing `0.12em`, with the "O" in NATION drawn as a cue ball in Lamp Glow `#B8925A` carrying a small Midnight `#010101` dot (the 8-ball nod).
- **Icon mark (favicon/app icon):** Circle (ball) in Cream `#EDDFC2` on Baize Teal `#0A5551` with a diagonal Smoked Bronze `#6D5330` cue line crossing at 45°. Dark-mode variant: Lamp Glow ball on Midnight.
- **Lockups:** Horizontal (default), Stacked (square placements), Icon-only (≤ 48 px).
- **Clear space:** Minimum = height of the "C" on all sides.
- **Minimum size:** Wordmark 120 px wide (digital), 30 mm (print). Icon 16 px.
- **Don'ts:** No stretching, no drop shadows on the wordmark, no Smoked Bronze logo on Midnight (contrast too low; use Lamp Glow or Cream), no Bronze-on-Teal pairing, no recolouring outside the palette.
- **File deliverables:** `logo-horizontal.svg`, `logo-stacked.svg`, `logo-icon.svg`, `logo-mono-dark.svg`, `logo-mono-light.svg`, `favicon.ico`, `apple-touch-icon.png` (180), `og-image.png` (1200×630).

### 3.4 Colour System — "Parlour Lounge"

**Source:** the four brand colours are taken directly from the brand reference photo (a dim, lamp-lit billiards parlour: cream walls, teal baize, warm timber, deep shadow). Everything else in this section is a *tint or shade derived from those four*, created only where accessibility or UI states require it. Nothing outside this family is used.

#### Core palette (from the reference image — do not alter)
| Role | Name | Hex | Where it comes from in the photo |
|---|---|---|---|
| Light base | **Parlour Cream** | `#EDDFC2` | Wall-lamp glow, warm walls |
| Primary | **Baize Teal** | `#0A5551` | The table cloth |
| Accent | **Smoked Bronze** | `#6D5330` | Timber rails, brass lamp shades |
| Dark base | **Midnight** | `#010101` | The shadows of the room |

#### Derived palette (generated from the core four)
| Role | Name | Hex | Derivation / purpose |
|---|---|---|---|
| Primary dark | Deep Teal | `#063B38` | Baize darkened — hover, pressed, footers, hero gradient start |
| Primary light | Teal Light | `#2FA39A` | Baize lightened — "Free" status, links and highlights **on dark** |
| Accent light | **Lamp Glow** | `#B8925A` | Bronze lightened — CTAs, timers, key accents **on dark/teal** (Bronze itself is too dark to read on Midnight) |
| Light surface | Cream Soft | `#F6EFDF` | Page background alternative |
| Light card | Cream Card | `#FBF7EC` | Cards on Cream |
| Dark surface | Night Card | `#0D1716` | Midnight with a trace of teal — staff cards |
| Dark line | Night Line | `#1E2B29` | Borders/dividers on dark |
| Text muted (light) | Ash Brown | `#5C5446` | Secondary text on Cream |
| Text muted (dark) | Mist | `#B9AE97` | Secondary text on Midnight |

#### Semantic palette (status only — kept warm/teal to stay in family)
| Meaning | Name | Hex (on light) | Hex (on dark) |
|---|---|---|---|
| Free / success | Baize / Teal Light | `#0A5551` | `#2FA39A` |
| Booked / warning | Lamp Amber | `#8A5E10` (text) / `#D9A441` (fill) | `#D9A441` |
| Danger | Cue Red | `#A3303E` | `#E27D88` |
| Maintenance | Slate | `#5C5446` | `#7A7F7E` |
| Info | Baize Teal | `#0A5551` | `#2FA39A` |

> The palette contains no blue: info and focus states use Teal.

#### Table status mapping (colour + label + icon — never colour alone)
| Status | Staff / dark UI | Owner / public / light UI | Label | Icon |
|---|---|---|---|---|
| free | `#2FA39A` | `#0A5551` | Available | ● |
| booked | `#D9A441` | `#8A5E10` | Booked | ◷ |
| running | `#EDDFC2` (Cream, subtle pulse) | `#6D5330` | In play | ▶ |
| maintenance | `#7A7F7E` | `#5C5446` | Offline | ⛔ |

#### Surface recipes (60 / 30 / 10 rule)
| Surface | 60 % | 30 % | 10 % (accent) |
|---|---|---|---|
| Public site | Cream `#EDDFC2` / Cream Soft | Baize Teal (hero, headers, footer) with Midnight sections for the table carousel and café | Bronze (on cream) / Lamp Glow (on teal/midnight) |
| Customer profile | Cream Soft | Cream Card | Bronze |
| Staff dashboard | Midnight `#010101` | Night Card `#0D1716` | Lamp Glow timers & CTAs, status colours |
| Kitchen screen | Midnight | Night Card | Lamp Amber for "New", Teal Light for "Served" |
| Owner dashboard | Cream Soft | Cream Card + Baize Teal sidebar | Bronze, chart series from teal/bronze/amber |

#### Button colour rules
| Context | Primary button | Secondary |
|---|---|---|
| On Cream / Cream Card | Bronze `#6D5330` bg · Cream `#EDDFC2` text | 1.5 px Baize Teal outline, Teal text |
| On Baize Teal (hero) | Lamp Glow `#B8925A` bg · Midnight `#010101` text | 1.5 px Cream outline, Cream text |
| On Midnight / Night Card | Lamp Glow bg · Midnight text | 1.5 px Lamp Glow outline |
| Hover | Bronze → `#5A4427` · Lamp Glow → `#A67F49` | |

#### Signature gradients & overlays
- **Hero:** linear 180° `#063B38` → `#010101`, plus a soft radial "lamp" `rgba(184,146,90,.14)` centred top-right.
- **Section fade (cream → teal):** `#EDDFC2` → `#0A5551` over 120 px.
- **Image scrim:** `linear-gradient(to top, rgba(1,1,1,.85), rgba(1,1,1,0))` so text sits legibly on photos.
- **Felt texture:** 3–4 % noise on Baize Teal only.

#### Accessibility contrast (WCAG 2.2 AA) — computed from the hex values
| Foreground | Background | Ratio | Use | Result |
|---|---|---|---|---|
| `#010101` | `#EDDFC2` | 15.8 : 1 | Body text on light | ✅ AA text |
| `#EDDFC2` | `#010101` | 15.8 : 1 | Body text on dark | ✅ AA text |
| `#EDDFC2` | `#0A5551` | 6.6 : 1 | Text on Baize Teal | ✅ AA text |
| `#0A5551` | `#EDDFC2` | 6.6 : 1 | Teal text / links on light | ✅ AA text |
| `#EDDFC2` | `#6D5330` | 5.4 : 1 | Button label on Bronze | ✅ AA text |
| `#6D5330` | `#EDDFC2` | 5.4 : 1 | Bronze text on light | ✅ AA text |
| `#5C5446` | `#EDDFC2` | 5.7 : 1 | Muted text on light (Ash Brown) | ✅ AA text |
| `#B8925A` | `#010101` | 7.3 : 1 | Timers / CTAs on dark (Lamp Glow) | ✅ AA text |
| `#010101` | `#B8925A` | 7.3 : 1 | Button label on Lamp Glow | ✅ AA text |
| `#2FA39A` | `#010101` | 6.8 : 1 | "Free" status text on dark | ✅ AA text |
| `#B9AE97` | `#010101` | 9.5 : 1 | Muted text on dark (Mist) | ✅ AA text |
| `#A3303E` | `#EDDFC2` | 5.2 : 1 | Error text on light (Cue Red) | ✅ AA text |
| `#B8925A` | `#0A5551` | 3.0 : 1 | Lamp Glow on Baize Teal | ⚠ Large text / UI borders only |
| `#6D5330` | `#010101` | 2.9 : 1 | Bronze on Midnight | ⛔ Fails — never use for text |
| `#0A5551` | `#010101` | 2.4 : 1 | Baize Teal on Midnight | ⛔ Fails — never use for text |
| `#6D5330` | `#0A5551` | 1.2 : 1 | Bronze on Baize Teal | ⛔ Fails — never use for text |

> Ratios were calculated with the WCAG relative-luminance formula (AA needs 4.5 : 1 for normal text, 3 : 1 for large text and UI borders). Rule of thumb: **Bronze lives on Cream; Lamp Glow lives on Teal and Midnight.** Re-verify with `axe` and a contrast check in CI (§12) whenever a colour changes.

### 3.5 Typography
| Role | Font | Weights | Notes |
|---|---|---|---|
| Display / headings | Playfair Display | 600, 700 | Club-elegance feel |
| Body / UI | Inter | 400, 500, 600 | Self-host via `next/font` (no third-party request, better privacy/perf) |
| Timers / money | Inter with `font-variant-numeric: tabular-nums` | 600, 700 | No digit jitter |

#### Type scale (mobile → desktop)
| Token | Size | Line height | Use |
|---|---|---|---|
| `display` | 40 → 64 px | 1.05 | Hero |
| `h1` | 32 → 44 px | 1.15 | Page titles |
| `h2` | 24 → 32 px | 1.2 | Sections |
| `h3` | 20 → 24 px | 1.3 | Card titles |
| `body` | 16 px | 1.6 | Default |
| `small` | 14 px | 1.5 | Meta |
| `timer-xl` | 48 → 72 px | 1 | Staff floor timers |

### 3.6 Iconography & Imagery
- Icon set: **Lucide** (consistent 1.75 px stroke), 20/24 px.
- Photography: Match the reference image: low-key, lamp-lit, deep shadows, teal baize catching a pool of warm light, shallow depth of field, cue + cloth close-ups, café steam, friends mid-laugh. Avoid stock-looking staged poses. Use real venue photos by launch; compress to WebP/AVIF, max 200 KB per hero image.
- Texture: Subtle felt noise overlay (3–4% opacity) on Baize Teal sections only.
- Illustration: Minimal line art of ball triangles and cue crossings in Lamp Glow at 20% opacity as section dividers.

### 3.7 Motion
| Element | Duration | Easing |
|---|---|---|
| Hover / press | 150 ms | `ease-out` |
| Card / drawer | 250 ms | `cubic-bezier(.2,.8,.2,1)` |
| Carousel | 350 ms | same |
| Availability flip (free → booked) | 300 ms colour + subtle pulse once | `ease-in-out` |
- Respect `prefers-reduced-motion`: disable pulses and carousel auto-advance.

### 3.8 Tone for UI Microcopy (reference strings)
| Key | Copy |
|---|---|
| `booking.confirmed` | "You're booked. Show this PIN at the desk." |
| `booking.slotTaken` | "Someone just grabbed that slot. Pick another?" |
| `pin.invalid` | "That PIN doesn't match. {n} tries left." |
| `pin.locked` | "Too many tries. Ask the owner to unlock." |
| `session.extraTimeConflict` | "Next booking starts in {m} min. Extend anyway?" |
| `order.noSession` | "No game running on this table. Ask staff to start one." |

---

## 4. Design System & UI Specs

### 4.1 Design Tokens

#### Tailwind config (`tailwind.config.ts`)
```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core four (from brand reference image)
        cream:    { DEFAULT: "#EDDFC2", soft: "#F6EFDF", card: "#FBF7EC" },
        baize:    { DEFAULT: "#0A5551", dark: "#063B38", light: "#2FA39A" },
        bronze:   { DEFAULT: "#6D5330", dark: "#5A4427", glow: "#B8925A", glowdark: "#A67F49" },
        midnight: { DEFAULT: "#010101", card: "#0D1716", line: "#1E2B29" },
        // Derived neutrals
        ash:  "#5C5446",
        mist: "#B9AE97",
        // Semantic
        amber:  { DEFAULT: "#D9A441", text: "#8A5E10" },
        cue:    { DEFAULT: "#A3303E", light: "#E27D88" },
        slate:  { DEFAULT: "#5C5446", dark: "#7A7F7E" },
        status: {
          free: "#2FA39A", booked: "#D9A441",
          running: "#EDDFC2", maintenance: "#7A7F7E",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans:    ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: { xl: "14px", "2xl": "20px" },
      boxShadow: {
        card: "0 1px 2px rgba(1,1,1,.06), 0 8px 24px rgba(1,1,1,.10)",
        lamp: "0 0 40px rgba(184,146,90,.18)",
      },
      backgroundImage: {
        hero: "linear-gradient(180deg,#063B38 0%,#010101 100%)",
        scrim: "linear-gradient(to top, rgba(1,1,1,.85), rgba(1,1,1,0))",
      },
    },
  },
} satisfies Config;
```

#### CSS variables (`src/app/globals.css`) — semantic tokens used by shadcn/ui
```css
:root {                       /* public, profile, owner (light) */
  --background: #F6EFDF;
  --foreground: #010101;
  --card: #FBF7EC;
  --card-foreground: #010101;
  --primary: #6D5330;          /* Bronze */
  --primary-foreground: #EDDFC2;
  --secondary: #0A5551;        /* Baize Teal */
  --secondary-foreground: #EDDFC2;
  --muted: #EDDFC2;
  --muted-foreground: #5C5446;
  --accent: #0A5551;
  --border: rgba(1,1,1,.10);
  --ring: #0A5551;
  --destructive: #A3303E;
}
.dark {                       /* staff + kitchen (dark) */
  --background: #010101;
  --foreground: #EDDFC2;
  --card: #0D1716;
  --card-foreground: #EDDFC2;
  --primary: #B8925A;          /* Lamp Glow */
  --primary-foreground: #010101;
  --secondary: #1E2B29;
  --secondary-foreground: #EDDFC2;
  --muted: #0D1716;
  --muted-foreground: #B9AE97;
  --accent: #2FA39A;
  --border: #1E2B29;
  --ring: #B8925A;
  --destructive: #E27D88;
}
```

### 4.2 Fonts (`src/app/fonts.ts`)
```ts
import { Playfair_Display, Inter } from "next/font/google";
export const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
export const inter    = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
```

### 4.3 Components

| Component | Spec |
|---|---|
| **Button — primary** | `rounded-xl`, h-11 (touch ≥ 44 px). On cream: Bronze bg + Cream text. On teal/midnight: Lamp Glow bg + Midnight text. Hover per §3.4 button rules. Focus ring 2 px (Teal on light, Lamp Glow on dark), offset 2 |
| **Button — secondary** | 1.5 px Baize Teal outline (light) / Lamp Glow outline (dark), transparent bg |
| **Button — danger** | Cue Red `#A3303E` bg, Cream text (on dark: `#E27D88` outline); requires confirm dialog for destructive actions |
| **Card** | `rounded-2xl`, `shadow-card`, 1 px border `rgba(0,0,0,.06)` (light) / `rgba(255,255,255,.06)` (dark) |
| **Table tile (staff)** | ≥ 160×160 px, status colour left bar (6 px) using the dark-UI status colours (§3.4), table name, status badge, `timer-xl` digits, quick actions |
| **Slot chip** | 3 states: available (outlined), selected (Bronze fill on light / Lamp Glow fill on dark), booked (struck-through, disabled, `aria-disabled`) |
| **Availability badge** | Dot + text ("Available now" / "Booked until 8:30 PM"), updates live |
| **Stepper** | 3 steps, current highlighted, back allowed, state persisted in URL search params |
| **Toast** | Bottom-centre mobile, top-right desktop, auto-dismiss 5 s, `role="status"` |
| **Empty state** | Illustration + one-line copy + single CTA |
| **Skeleton** | Shimmer, matches final layout to prevent CLS |

### 4.4 Layout Principles
| Surface | Theme | Device priority | Key traits |
|---|---|---|---|
| Public site | Cream base, Baize Teal hero, Midnight table/café sections, Bronze/Lamp Glow buttons | **Mobile-first** | Large photography, card carousel |
| Customer profile | Cream Soft | Mobile-first | Timer card, PIN card, bookings list |
| Staff dashboard | Midnight + Night Card, Lamp Glow accents | **Tablet-first (landscape)** | Big tiles, big digits, minimal typing |
| Kitchen screen | Midnight + Night Card | Tablet/TV | Huge ticket cards, audio chime on new order |
| Owner dashboard | Cream Soft + Baize Teal sidebar | Desktop | Charts, calendar heatmap, data tables |

### 4.5 Key Screens
| Screen | Elements |
|---|---|
| Home | Hero + CTA · Table carousel (price, slots, live availability, Book) · Café highlights · About |
| Booking | Stepper (Table → Slot → Details), sticky price summary bar |
| Confirmation | Booking ID + PIN card, Copy buttons, Download-as-image, "Add to calendar" |
| Profile | Upcoming/past bookings, PIN, live timer, orders & bill |
| Staff — Floor | Table grid with status + timer · PIN modal · +Time · Offline booking |
| Staff — Orders | Live queue per table · menu editor |
| Kitchen | Tickets: New → Preparing → Served |
| Owner — Overview | Revenue, expenses, profit, bookings, monthly calendar |
| Owner — Reports | Filterable table, PDF/Excel export |
| Owner — Settings | Website content, pricing, menu, staff accounts |

---

## 5. Architecture

### 5.1 Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript (strict)** | SSR/SEO, server actions, one codebase |
| Styling | Tailwind CSS + shadcn/ui | Consistent, accessible primitives |
| DB / Auth / Realtime | **Supabase** (Postgres, Auth, Realtime, RLS) | Atomic DB logic, live sync, Google OAuth |
| Validation | **Zod** (shared client + server) | Single source of input truth |
| State / data | TanStack Query + Supabase Realtime | Cache + live invalidation |
| Forms | React Hook Form + Zod resolver | Reliable validation UX |
| QR | `qrcode` | Per-table signed URL |
| Export | `jspdf` + `jspdf-autotable`, `exceljs` | PDF / Excel (see §11: avoid unmaintained `xlsx` from npm — known advisories) |
| Charts | Recharts | Owner analytics |
| Rate limit | Upstash Redis (`@upstash/ratelimit`) | Edge-friendly |
| Monitoring | Sentry + Vercel Analytics | Errors & performance |
| Hosting | Vercel (app) + Supabase (data) | Fast deploy, global CDN |
| Tests | Vitest, Playwright, pgTAP, k6 | See §12 |

### 5.2 System Diagram
```
┌──────────────┐   HTTPS    ┌─────────────────────┐
│  Browser     │──────────► │  Vercel (Next.js)   │
│  (Customer/  │ ◄──────────│  RSC + Server Actions│
│  Staff/Owner)│            └─────────┬───────────┘
└──────┬───────┘                      │ supabase-js (user JWT)
       │ WebSocket (Realtime)         ▼
       │                    ┌─────────────────────────┐
       └──────────────────► │ Supabase                │
                            │  • Auth (Google/email)  │
                            │  • Postgres + RLS       │
                            │  • RPC (SECURITY DEFINER│
                            │    create_booking, etc.)│
                            │  • Realtime (CDC)       │
                            │  • pg_cron (no-show     │
                            │    release, cleanup)    │
                            └─────────────────────────┘
                 Upstash Redis (rate limits) · Sentry (errors)
```

### 5.3 Core Architectural Principles
1. **The database is the source of truth and the referee.** Every rule that must never be violated (no double-booking, PIN checks, bill totals) is enforced in Postgres, not only in the UI.
2. **Server time only.** `started_at`, booking times and expiry are set by the DB (`now()`); clients only compute `elapsed = serverNow − started_at`.
3. **Least privilege.** The browser uses the anon key + user JWT + RLS. The service-role key exists only in server-side code and never ships to the client.
4. **Public reads expose no PII.** Live availability is served from a sanitized table (`booked_slots`) with no names, phones or booking IDs.
5. **Idempotent, atomic writes** via RPC functions in single transactions.
6. **Every input validated twice** (client for UX, server for safety).

---

## 6. Project Structure

```
cue-nation/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # lint, types, unit, dead-code, audit
│       ├── e2e.yml                # Playwright on preview deploy
│       └── security.yml           # CodeQL, gitleaks, dependency review
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_extensions_enums.sql
│   │   ├── 0002_core_tables.sql
│   │   ├── 0003_booked_slots_sync.sql
│   │   ├── 0004_rpc_functions.sql
│   │   ├── 0005_rls_policies.sql
│   │   └── 0006_cron_jobs.sql
│   ├── seed.sql                   # dev/staging only — never run in prod
│   └── tests/                     # pgTAP: rls.test.sql, booking.test.sql
├── src/
│   ├── app/
│   │   ├── (public)/              # home, tables, café, about
│   │   ├── (auth)/                # login, signup, callback
│   │   ├── book/                  # 3-step flow
│   │   ├── profile/
│   │   ├── t/[tableToken]/menu/   # QR ordering (Tier 2)
│   │   ├── staff/                 # floor, bookings, orders, menu, kitchen
│   │   ├── owner/                 # overview, calendar, expenses, reports, settings
│   │   ├── api/                   # only where RSC/actions don't fit (webhooks, export)
│   │   ├── layout.tsx · fonts.ts · globals.css
│   │   └── not-found.tsx · error.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn primitives
│   │   ├── booking/ · tables/ · staff/ · owner/ · brand/
│   ├── lib/
│   │   ├── supabase/ {client.ts, server.ts, admin.ts (server-only)}
│   │   ├── realtime/ {useAvailability.ts, useSessionTimer.ts}
│   │   ├── validation/            # Zod schemas (shared)
│   │   ├── billing/ {calculate.ts, calculate.test.ts}
│   │   ├── security/ {rateLimit.ts, headers.ts, pin.ts, qrToken.ts}
│   │   ├── time.ts                # IST helpers, slot math
│   │   └── env.ts                 # Zod-validated env (fails fast on boot)
│   ├── middleware.ts              # session refresh + role gating
│   └── types/ database.ts         # generated from Supabase
├── tests/
│   ├── e2e/                       # Playwright specs
│   ├── load/                      # k6 scripts
│   └── security/                  # abuse-case tests
├── public/ {brand/, images/}
├── docs/ {BRAND.md (this kit), RUNBOOK.md}
├── .env.example                   # keys only, no values
├── knip.json · eslint.config.mjs · tsconfig.json · next.config.ts
└── package.json
```

> Rule: nothing lives outside this tree. Any file not referenced from this structure is a candidate for deletion (§13).

---

## 7. Database Schema (Production SQL)

> Run as ordered migrations. This is the heart of the live-sync and anti-double-booking guarantee.

### 7.1 Extensions & Enums (`0001`)
```sql
create extension if not exists btree_gist;   -- required for exclusion constraint on uuid + range
create extension if not exists pgcrypto;     -- PIN hashing, random tokens
create extension if not exists pg_cron;

create type user_role      as enum ('customer','staff','owner');
create type table_type     as enum ('pool','snooker');
create type table_status   as enum ('free','booked','running','maintenance');
create type booking_status as enum ('confirmed','checked_in','completed','cancelled','no_show');
create type booking_source as enum ('online','offline');
create type order_status   as enum ('new','preparing','served','cancelled');
create type pay_mode       as enum ('cash','upi','card');
```

### 7.2 Core Tables (`0002`)
```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  email       text not null,
  phone       text check (phone ~ '^\+?[0-9]{10,13}$'),
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now()
);

create table game_tables (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  type        table_type not null,
  status      table_status not null default 'free',
  qr_secret   text not null default encode(gen_random_bytes(16),'hex'), -- rotate to invalidate printed QR
  active      boolean not null default true
);

create table pricing (
  id            uuid primary key default gen_random_uuid(),
  table_type    table_type not null,
  label         text not null,                       -- "Weekday Morning", "Peak"
  days          int[] not null,                      -- 0..6
  start_time    time not null,
  end_time      time not null,
  price_per_hour numeric(8,2) not null check (price_per_hour >= 0)
);

create table bookings (
  id            uuid primary key default gen_random_uuid(),
  booking_code  text not null unique,                -- e.g. CN-7K3F9Q (non-guessable)
  user_id       uuid references profiles(id),        -- null for walk-ins
  guest_name    text, guest_phone text,
  table_id      uuid not null references game_tables(id),
  during        tstzrange not null,                  -- [start, end)
  status        booking_status not null default 'confirmed',
  source        booking_source not null,
  pin_hash      text not null,                       -- bcrypt via crypt(); plain PIN shown ONCE
  pin_attempts  int  not null default 0,
  amount        numeric(10,2) not null check (amount >= 0),
  created_at    timestamptz not null default now(),
  -- THE anti-double-booking guarantee:
  constraint no_overlap exclude using gist
    (table_id with =, during with &&)
    where (status in ('confirmed','checked_in'))
);
create index on bookings (user_id);
create index on bookings using gist (during);

create table sessions (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null unique references bookings(id),
  table_id      uuid not null references game_tables(id),
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  extra_minutes int not null default 0 check (extra_minutes >= 0),
  time_charge   numeric(10,2) not null default 0
);
-- one running session per table
create unique index one_running_session_per_table on sessions(table_id) where ended_at is null;

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null, category text not null,
  price numeric(8,2) not null check (price >= 0),
  available boolean not null default true, image_url text
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id),
  table_id   uuid not null references game_tables(id),
  status order_status not null default 'new',
  created_at timestamptz not null default now()
);
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id),
  qty int not null check (qty between 1 and 20),
  price numeric(8,2) not null                         -- snapshot price at order time
);

create table bills (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references sessions(id),
  time_charge numeric(10,2) not null,
  food_charge numeric(10,2) not null default 0,
  total numeric(10,2) generated always as (time_charge + food_charge) stored,
  paid boolean not null default false,
  pay_mode pay_mode, paid_at timestamptz
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null, amount numeric(10,2) not null check (amount > 0),
  spent_on date not null, note text, created_by uuid references profiles(id)
);

create table site_content (
  key text primary key, value jsonb not null,
  updated_by uuid references profiles(id), updated_at timestamptz not null default now()
);

create table audit_log (
  id bigserial primary key, actor uuid, action text not null,
  entity text not null, entity_id text, meta jsonb,
  at timestamptz not null default now()
);
```

### 7.3 Public, PII-free availability table (`0003`)
```sql
-- What the whole internet may see. No names, no phones, no booking codes.
create table booked_slots (
  booking_id uuid primary key references bookings(id) on delete cascade,
  table_id   uuid not null references game_tables(id),
  during     tstzrange not null
);
create index on booked_slots using gist (table_id, during);

create function sync_booked_slots() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'DELETE') then delete from booked_slots where booking_id = old.id; return old; end if;
  if (new.status in ('confirmed','checked_in')) then
    insert into booked_slots(booking_id, table_id, during)
    values (new.id, new.table_id, new.during)
    on conflict (booking_id) do update set table_id = excluded.table_id, during = excluded.during;
  else
    delete from booked_slots where booking_id = new.id;   -- cancelled / completed / no_show frees the slot live
  end if;
  return new;
end $$;

create trigger trg_sync_booked_slots
after insert or update or delete on bookings
for each row execute function sync_booked_slots();

alter publication supabase_realtime add table booked_slots, game_tables, sessions, orders;
```

### 7.4 Atomic RPC functions (`0004`)
```sql
-- Customer/staff booking. Returns plain PIN exactly once.
create function create_booking(p_table uuid, p_start timestamptz, p_end timestamptz,
                               p_guest_name text default null, p_guest_phone text default null,
                               p_source booking_source default 'online')
returns table(booking_id uuid, booking_code text, pin text)
language plpgsql security definer set search_path = public as $$
declare
  v_pin text := lpad((floor(random()*1000000))::int::text, 6, '0');  -- replace with crypto-random in app layer if preferred
  v_code text := 'CN-' || upper(encode(gen_random_bytes(4),'hex'));
  v_role user_role; v_amount numeric; v_id uuid;
begin
  if p_start >= p_end or p_start < now() - interval '5 minutes' then raise exception 'INVALID_RANGE'; end if;
  if p_end - p_start > interval '6 hours' then raise exception 'RANGE_TOO_LONG'; end if;

  select role into v_role from profiles where id = auth.uid();
  if p_source = 'offline' and v_role not in ('staff','owner') then raise exception 'FORBIDDEN'; end if;
  if p_source = 'online'  and auth.uid() is null then raise exception 'UNAUTHENTICATED'; end if;

  v_amount := compute_price(p_table, p_start, p_end);                 -- server-side price; never trust client

  insert into bookings(booking_code,user_id,guest_name,guest_phone,table_id,during,source,pin_hash,amount)
  values (v_code, case when p_source='online' then auth.uid() end, p_guest_name, p_guest_phone,
          p_table, tstzrange(p_start,p_end,'[)'), p_source, crypt(v_pin, gen_salt('bf',10)), v_amount)
  returning id into v_id;                                              -- exclusion constraint raises 23P01 if overlap

  insert into audit_log(actor,action,entity,entity_id) values (auth.uid(),'booking.create','booking',v_id::text);
  return query select v_id, v_code, v_pin;
end $$;

-- Staff PIN check + session start (with attempt limiting)
create function start_session(p_code text, p_pin text) returns uuid
language plpgsql security definer set search_path = public as $$
declare b bookings; v_sid uuid;
begin
  if not exists (select 1 from profiles where id=auth.uid() and role in ('staff','owner')) then raise exception 'FORBIDDEN'; end if;
  select * into b from bookings where booking_code = p_code and status = 'confirmed' for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if b.pin_attempts >= 5 then raise exception 'PIN_LOCKED'; end if;
  if crypt(p_pin, b.pin_hash) <> b.pin_hash then
    update bookings set pin_attempts = pin_attempts + 1 where id = b.id;
    raise exception 'PIN_INVALID';
  end if;
  if now() < lower(b.during) - interval '15 minutes' then raise exception 'TOO_EARLY'; end if;
  insert into sessions(booking_id, table_id) values (b.id, b.table_id) returning id into v_sid;
  update bookings set status='checked_in' where id=b.id;
  update game_tables set status='running' where id=b.table_id;
  return v_sid;
end $$;

-- Extra time with conflict detection
create function add_extra_time(p_session uuid, p_minutes int, p_force boolean default false) returns void
language plpgsql security definer set search_path = public as $$
declare s sessions; b bookings; v_new tstzrange;
begin
  if not exists (select 1 from profiles where id=auth.uid() and role in ('staff','owner')) then raise exception 'FORBIDDEN'; end if;
  if p_minutes not between 5 and 180 then raise exception 'INVALID_MINUTES'; end if;
  select * into s from sessions where id=p_session and ended_at is null for update;
  select * into b from bookings where id=s.booking_id;
  v_new := tstzrange(lower(b.during), upper(b.during) + make_interval(mins => p_minutes), '[)');
  if exists (select 1 from bookings where table_id=b.table_id and id<>b.id
             and status='confirmed' and during && v_new) and not p_force then
    raise exception 'NEXT_BOOKING_CONFLICT';
  end if;
  update sessions set extra_minutes = extra_minutes + p_minutes where id = s.id;
end $$;

-- Helper: compute_price(), end_session(), place_order(), mark_paid() follow the same pattern:
-- SECURITY DEFINER, role check, row lock (FOR UPDATE), single transaction, audit_log insert.
```

### 7.5 Row-Level Security (`0005`)
```sql
alter table profiles      enable row level security;
alter table bookings      enable row level security;
alter table sessions      enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;
alter table bills         enable row level security;
alter table expenses      enable row level security;
alter table site_content  enable row level security;
alter table audit_log     enable row level security;
alter table booked_slots  enable row level security;
alter table game_tables   enable row level security;
alter table pricing       enable row level security;
alter table menu_items    enable row level security;

create function my_role() returns user_role language sql stable security definer set search_path=public as
$$ select role from profiles where id = auth.uid() $$;

-- Public read (safe, PII-free)
create policy "public read slots"   on booked_slots for select using (true);
create policy "public read tables"  on game_tables  for select using (active);
create policy "public read pricing" on pricing      for select using (true);
create policy "public read menu"    on menu_items   for select using (available);
create policy "public read content" on site_content for select using (true);

-- Customers: own rows only
create policy "own profile"  on profiles for select using (id = auth.uid() or my_role() in ('staff','owner'));
create policy "own bookings" on bookings for select using (user_id = auth.uid() or my_role() in ('staff','owner'));
create policy "own sessions" on sessions for select using (
  exists (select 1 from bookings b where b.id = booking_id and b.user_id = auth.uid()) or my_role() in ('staff','owner'));

-- Role escalation protection: users can NEVER update their own role
create policy "update own profile (no role)" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));

-- Owner only
create policy "owner expenses" on expenses for all using (my_role()='owner') with check (my_role()='owner');
create policy "owner content write" on site_content for all using (my_role()='owner') with check (my_role()='owner');
create policy "owner audit read" on audit_log for select using (my_role()='owner');

-- No direct INSERT/UPDATE/DELETE on bookings/sessions/bills for clients: all writes go through RPCs.
revoke insert, update, delete on bookings, sessions, bills, order_items from anon, authenticated;
```

### 7.6 Scheduled jobs (`0006`)
```sql
-- Auto-release no-shows 15 min after start
select cron.schedule('release-no-shows','* * * * *', $$
  update bookings set status='no_show'
  where status='confirmed' and lower(during) < now() - interval '15 minutes'
$$);
-- Purge expired data, keep audit trail
select cron.schedule('trim-booked-slots','0 3 * * *', $$
  delete from booked_slots where upper(during) < now() - interval '1 day'
$$);
```

---

## 8. Live Sync Engine

> **Requirement:** The moment one person books a slot, every other visitor must see it as booked — and no two people can ever hold the same slot.

### 8.1 Three layers of protection

| Layer | Mechanism | Prevents |
|---|---|---|
| **L1 — Database** | `EXCLUDE USING gist (table_id =, during &&)` | Two simultaneous bookings (race condition). **This is the real guarantee.** |
| **L2 — Realtime** | Supabase Realtime on `booked_slots` | Stale UI: other users see the slot flip to "Booked" within ~1 s |
| **L3 — UI optimism** | Disable slot on click, show loading, handle `23P01` gracefully | Confusing errors when two people click at the same instant |

### 8.2 Client hook (`src/lib/realtime/useAvailability.ts`)
```ts
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Slot = { booking_id: string; table_id: string; during: string };

export function useAvailability(tableId: string, dayStartISO: string, dayEndISO: string) {
  const supabase = createClient();
  const [booked, setBooked] = useState<Slot[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("booked_slots").select("*")
        .eq("table_id", tableId)
        .overlaps("during", `[${dayStartISO},${dayEndISO})`);
      if (active && data) setBooked(data as Slot[]);
    };
    load();

    const channel = supabase.channel(`slots:${tableId}`)
      .on("postgres_changes",
          { event: "*", schema: "public", table: "booked_slots", filter: `table_id=eq.${tableId}` },
          () => load())                                    // refetch on any change: simple, always correct
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") load();               // resync after reconnect — no missed events
      });

    const poll = setInterval(load, 30_000);                // safety net if socket silently dies
    return () => { active = false; clearInterval(poll); supabase.removeChannel(channel); };
  }, [tableId, dayStartISO, dayEndISO]);

  return { booked, live };
}
```

### 8.3 Booking submit — graceful conflict handling
```ts
const { data, error } = await supabase.rpc("create_booking", { p_table, p_start, p_end, p_source: "online" });
if (error?.code === "23P01") {            // exclusion_violation
  toast.error(copy.booking.slotTaken);     // "Someone just grabbed that slot. Pick another?"
  refetchAvailability();                   // slot is now shown as booked
  return;
}
```

### 8.4 Live timer (survives refresh, identical on staff + customer screens)
```ts
// src/lib/realtime/useSessionTimer.ts
export function useSessionTimer(startedAtISO: string, extraMinutes = 0) {
  const [now, setNow] = useState(Date.now());
  const offset = useServerClockOffset();                    // fetch once: serverNow - Date.now()
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const elapsedSec = Math.max(0, Math.floor((now + offset - Date.parse(startedAtISO)) / 1000));
  return { elapsedSec, extraMinutes };
}
```
- `started_at` is the only stored value; elapsed time is derived. Refresh, reconnect, or switching device always shows the same number.
- `useServerClockOffset` calls a tiny RPC `select now()` once and caches the difference, so a customer with a wrong phone clock still sees the correct time.

### 8.5 Live-sync acceptance tests (must pass before launch)
1. Open the site in two browsers. Book slot A in browser 1 → browser 2 shows A as booked within 2 s with no refresh.
2. Fire 50 concurrent `create_booking` calls for the same slot → **exactly 1 succeeds**, 49 get `23P01`.
3. Cancel the booking → slot shows available in other browser within 2 s.
4. Kill network on a browser for 30 s, restore → state resyncs automatically.
5. Staff starts session → customer profile timer appears and matches staff timer to the second.

---

## 9. Feature Specifications

### 9.1 Customer Website
1. **Auth:** Google OAuth + email/password (min 10 chars, breach-password check enabled in Supabase). Profile auto-created by DB trigger on first sign-in with role `customer`.
2. **Home sections (order):** Hero + CTA → Table carousel (Pool/Snooker cards: pricing, slot options, live availability badge, **Book** button) → Café → About.
3. **Booking flow (3 steps):** Table → Date & slot (price per slot; booked slots disabled live) → Details & confirm. Step state kept in URL so refresh doesn't lose progress.
4. **Confirmation:** Booking ID + 6-digit PIN card, Copy buttons, Download as image (`html-to-image`), saved to profile. PIN is shown once at creation and also retrievable by the owning user in their profile (re-derived via a separate encrypted `pin_display` column OR regenerated by "Reveal PIN" action that rotates the hash — choose rotate approach for security).
5. **Profile:** Upcoming/past bookings, PIN, live timer, orders & bill.

### 9.2 Staff Dashboard
- **Floor:** table grid with status colours, live timers, PIN modal, +Time, End, Offline booking.
- **Offline booking:** name, phone, table, slot; blocks the slot exactly like online (same RPC, same constraint); "Start now" option.
- **Bookings:** search, filter by date/status/source, edit / cancel / reschedule (reschedule = new range validated by the same constraint).
- **Extra time:** `add_extra_time` with conflict warning against next booking.
- **Menu:** add / edit / disable items.
- **Orders & Kitchen:** live ticket board New → Preparing → Served.

### 9.3 Owner Dashboard
- Everything staff can do.
- Overview: revenue, expenses, profit, bookings; charts.
- Monthly calendar with per-day booking drawer; heatmap of busy hours.
- Expense tracker with categories, monthly totals.
- Reports: filter + totals; export PDF / Excel (server-side route, owner-only, rate-limited).
- Settings: website content, pricing, menu, staff accounts (invite → set role server-side).

### 9.4 QR Table Ordering (Tier 2)
- URL: `/t/{tableToken}/menu`, where `tableToken = HMAC(tableId + qr_secret)`; no login required.
- Order accepted **only if a session is running on that table** (else show `order.noSession` copy).
- Rate-limited per IP + per table (e.g. 5 orders / 10 min).
- Served orders automatically roll into that session's bill.
- Printable page with all QR codes (owner-only).

### 9.5 Billing
- Bill = time charge (base + extra minutes at slot rate, per-minute proration after the first block) + food charge (sum of served `order_items`).
- Pure function `calculateBill()` in `lib/billing/calculate.ts` — unit tested exhaustively (§12).
- Mark paid with mode (cash / UPI / card); printable receipt; immutable once paid (corrections via audit-logged owner adjustment).

---

## 10. Staged Build Plan

Each stage ends with a **Done-when** checklist. Do not start the next stage until the gate passes. Commit per stage; tag `stage-N`.

### 10.0 Parallel split (if more than one person)
| Track | Stages |
|---|---|
| A — Data & Security | 0.1 DB migrations, RLS, RPC, pgTAP tests, 4, 9-security |
| B — Customer | 1, 2, 3 |
| C — Staff | 4–5, 7 |
| D — Owner & Tier 2 | 6, 8 |

### Stage 0 — Foundation
- Create project, install dependencies, configure strict TS, ESLint, Prettier, `knip`.
- Apply brand tokens (§3–4), fonts, layouts `(public)`, `/staff` (dark), `/owner` (light).
- `lib/env.ts` Zod env validation (app refuses to boot with missing secrets).
- Supabase project (separate **staging** and **production**), run migrations, seed staging only.
- Set up CI skeleton and Vercel preview.
- **Done-when:** `pnpm build` passes, three layouts render with brand theme, CI green, env validation fails on missing var.

### Stage 1 — Auth & Profile
- Google + email auth, callback route, DB trigger creating `profiles`.
- Middleware: refresh session, role-gate `/staff` (staff|owner), `/owner` (owner), `/profile` (any logged in).
- Role redirect after login.
- **Done-when:** customer cannot open `/staff` or `/owner` (verified by Playwright), role cannot be self-escalated (pgTAP test), profile auto-created.

### Stage 2 — Public Website
- Hero, table carousel with live badge, café, about; content from `site_content`.
- SEO: metadata, OG image, sitemap, robots, JSON-LD `LocalBusiness`.
- **Done-when:** Lighthouse mobile ≥ 90 (perf/a11y/SEO), carousel smooth, Book opens flow.

### Stage 3 — Booking Flow + Live Sync
- Implement `create_booking`, `compute_price`, `useAvailability`, 3-step UI, confirmation card.
- **Done-when:** all five live-sync acceptance tests (§8.5) pass; PIN copyable; booking in profile; slot unavailable for others instantly.

### Stage 4 — Staff Floor & Timers
- Floor grid, PIN modal (`start_session`), live timer, `add_extra_time`, `end_session`.
- **Done-when:** PIN starts timer; customer sees identical timer; wrong PIN ×5 locks; extra time shows conflict warning.

### Stage 5 — Offline Bookings & Management
- Offline form, bookings list with search/filter, edit/cancel/reschedule.
- **Done-when:** online + offline bookings appear together; offline booking blocks the slot on the public site live.

### Stage 6 — QR Ordering & Kitchen *(Tier 2)*
- Signed table tokens, menu page, cart, `place_order`, kitchen board with chime, printable QR sheet.
- **Done-when:** scan → order → kitchen sees in < 2 s → served → bill updates; ordering blocked when no session.

### Stage 7 — Billing
- Bill view, `mark_paid`, receipt print stylesheet.
- **Done-when:** end session → combined bill correct to the rupee → paid → stored.

### Stage 8 — Owner Dashboard *(Tier 2)*
- Overview, calendar, expenses, reports + export, settings.
- **Done-when:** all numbers reconcile with raw data; exports open correctly in Excel/PDF; staff accounts creatable by owner only.

### Stage 9 — Hardening, QA, Cleanup, Deploy
- Execute §11 (security), §12 (tests), §13 (dead code), §14 (deploy).
- **Done-when:** every gate in §18 is ticked.

---

## 11. Security & Cyber-Attack Hardening

### 11.1 Threat model (what we defend against)
| # | Attack | Where it would hit | Defence |
|---|---|---|---|
| 1 | **Double-booking / race condition** | Booking | DB exclusion constraint + atomic RPC (§7, §8) |
| 2 | **Broken access control / IDOR** (reading someone else's booking) | API, RLS | RLS on every table; ownership checks; unguessable `booking_code`; pgTAP tests |
| 3 | **Privilege escalation** (customer → owner) | profiles | RLS `with check` forbids role change; role changes only via owner-only RPC |
| 4 | **SQL injection** | All queries | Parameterised queries via supabase-js/RPC only; zero string-built SQL; `set search_path` on every `SECURITY DEFINER` function |
| 5 | **XSS** | Names, notes, menu items, CMS content | React auto-escaping; never `dangerouslySetInnerHTML` (lint rule bans it); CMS content stored as plain text/JSON, rendered as text; strict CSP |
| 6 | **CSRF** | Mutations | Server Actions (built-in origin checks) + SameSite=Lax cookies; custom API routes verify `Origin` |
| 7 | **PIN brute force** | `start_session` | 5-attempt lockout per booking, staff-only, rate limit; 6-digit PIN + booking code required |
| 8 | **Credential stuffing / brute-force login** | Auth | Supabase rate limits + Upstash limit on auth endpoints, CAPTCHA (Turnstile) on signup, breach-password check |
| 9 | **Bot spam bookings (slot-hoarding)** | `create_booking` | Rate limit (e.g. 5/10 min/user), max 2 active future bookings per user, Turnstile, unpaid holds auto-expire (no-show rule) |
| 10 | **QR order abuse / prank orders** | `/t/...` | HMAC-signed table token, session-must-be-running rule, per-IP & per-table rate limits, qty caps, staff can cancel |
| 11 | **Service-role key leak** | Env | Key only in server runtime (`import "server-only"`), never `NEXT_PUBLIC_`, gitleaks in CI, rotate on suspicion |
| 12 | **Clickjacking** | All pages | `frame-ancestors 'none'` / `X-Frame-Options: DENY` |
| 13 | **Data exposure in realtime** | Realtime channels | Only PII-free `booked_slots` is public; private tables gated by RLS |
| 14 | **Dependency / supply-chain** | npm | `pnpm audit`, Dependabot, lockfile committed, `--frozen-lockfile` in CI, avoid abandoned packages (use `exceljs` not vulnerable `xlsx` from npm) |
| 15 | **DoS / scraping** | Public pages | Vercel edge caching, rate limiting, WAF rules, pagination limits |
| 16 | **Open redirect** | Login callback | Allow-list `next` param to same-origin relative paths |
| 17 | **File/Image upload abuse** | Menu/site images | Owner/staff only; MIME + size check; Supabase Storage with policies; no executable types |
| 18 | **Export abuse / CSV injection** | Excel/CSV | Owner-only; prefix cells starting with `= + - @` with `'`; rate-limit |
| 19 | **Time manipulation** | Timers, no-show | Server `now()` only |
| 20 | **Log leakage / PII** | Sentry, logs | Scrub PII, never log PINs/tokens |

### 11.2 Security headers (`next.config.ts`)
```ts
const csp = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{nonce}' https://challenges.cloudflare.com",   // nonce injected by middleware
  "style-src 'self' 'unsafe-inline'",                                       // tighten with nonces if possible
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'", "form-action 'self'", "object-src 'none'",
].join("; ");

export default {
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-Frame-Options", value: "DENY" },
    ]}];
  },
};
```

### 11.3 Input validation pattern (`lib/validation/booking.ts`)
```ts
import { z } from "zod";
export const bookingInput = z.object({
  tableId: z.string().uuid(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  guestName: z.string().trim().min(1).max(80).optional(),
  guestPhone: z.string().regex(/^\+?[0-9]{10,13}$/).optional(),
}).refine(v => v.end > v.start, "End must be after start")
  .refine(v => v.end.getTime() - v.start.getTime() <= 6 * 3600_000, "Max 6 hours");
```

### 11.4 Rate limiting (`lib/security/rateLimit.ts`)
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
export const limits = {
  booking: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "10 m"), prefix: "rl:booking" }),
  auth:    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "10 m"), prefix: "rl:auth" }),
  order:   new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "10 m"), prefix: "rl:order" }),
  export:  new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:export" }),
};
```

### 11.5 Signed QR token (`lib/security/qrToken.ts`)
```ts
import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
export const signTable = (tableId: string, secret: string) =>
  `${tableId}.${createHmac("sha256", process.env.QR_SIGNING_KEY!).update(tableId + secret).digest("base64url")}`;
export function verifyTable(token: string, secret: string) {
  const [id, sig] = token.split(".");
  const expected = signTable(id, secret).split(".")[1];
  return sig && sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? id : null;
}
```

### 11.6 Secrets & environment
| Variable | Exposure | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Safe only because RLS is on |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Never imported in client code (`server-only` guard) |
| `QR_SIGNING_KEY` | Server only | 32+ random bytes |
| `UPSTASH_REDIS_REST_URL/TOKEN` | Server only | |
| `SENTRY_DSN`, `TURNSTILE_SECRET` | Server only | |
- `.env*` in `.gitignore`; `.env.example` lists names only.
- Different keys for staging and production. Rotate all keys if any were ever pasted into chat, screenshots or commits.

### 11.7 Security verification checklist
- [ ] Every table has RLS enabled (`select relname from pg_class where relrowsecurity = false and relnamespace = 'public'::regnamespace` returns nothing for app tables).
- [ ] Anonymous request to `bookings` returns zero rows.
- [ ] Customer A cannot read Customer B's booking/profile/session/bill.
- [ ] Customer cannot call staff/owner RPCs (returns `FORBIDDEN`).
- [ ] Role self-update rejected.
- [ ] `gitleaks` finds no secrets in history.
- [ ] `pnpm audit --prod` has no high/critical issues.
- [ ] CSP has no `unsafe-eval`; securityheaders.com grade A.
- [ ] OWASP ZAP baseline scan against staging: no medium+ findings unresolved.
- [ ] Seed demo accounts (`demo@…`, `staff@…`, `owner@…` with known passwords) **do not exist in production**.

> ⚠ **Important:** The demo credentials in the original plan (`Owner@123` etc.) are for local/staging only. If they exist in production, anyone can log in as owner. Production owner/staff accounts must use unique strong passwords + MFA.

---

## 12. Testing Strategy

### 12.1 Test pyramid
| Level | Tool | Scope | Target |
|---|---|---|---|
| Static | TypeScript strict, ESLint (+ `eslint-plugin-security`), Prettier | Whole codebase | 0 errors |
| Unit | Vitest | Billing, time/slot math, validation, qrToken, pin | ≥ 90 % on `lib/billing`, `lib/time` |
| DB | pgTAP | RLS, constraints, RPCs | Every policy + RPC |
| Integration | Vitest + Supabase local | Server actions, RPC flows | Critical paths |
| E2E | Playwright (Chromium, WebKit, mobile viewport, tablet viewport) | Full user journeys | See below |
| Concurrency | Node script / k6 | Race conditions | 1 winner of N |
| Load | k6 | Public pages + booking | 200 VUs, p95 < 800 ms, error < 1 % |
| Security | ZAP baseline, gitleaks, CodeQL, `pnpm audit`, custom abuse tests | Whole app | No unresolved medium+ |
| Accessibility | axe-core in Playwright | All key pages | 0 serious/critical |
| Visual | Playwright screenshots | Brand-critical screens | No unexpected diff |

### 12.2 Unit tests — billing (`calculate.test.ts`)
```ts
describe("calculateBill", () => {
  it("charges base slot at hourly rate", () => expect(calc({ minutes: 60, rate: 300 })).toBe(300));
  it("prorates extra minutes", () => expect(calc({ minutes: 60, extra: 30, rate: 300 })).toBe(450));
  it("adds served food only", () => expect(calc({ minutes: 60, rate: 300, food: [{ price: 80, qty: 2, status: "served" }, { price: 50, qty: 1, status: "cancelled" }] })).toBe(460));
  it("never returns negative or NaN", () => expect(Number.isFinite(calc({ minutes: 0, rate: 0 }))).toBe(true));
  it("rounds to 2 decimals consistently", () => expect(calc({ minutes: 7, rate: 333 })).toBe(38.85));
  it("handles price change between slots (peak boundary)", () => { /* 6:30–7:30 across 7 PM peak */ });
});
```

### 12.3 DB tests (pgTAP highlights)
- Overlapping insert on same table → fails with `exclusion_violation`.
- Adjacent ranges `[6,7)` and `[7,8)` → both succeed.
- Cancelled booking frees the slot and removes the `booked_slots` row.
- Customer cannot `select` another user's booking (0 rows).
- Customer cannot `update profiles set role='owner'`.
- `start_session` with wrong PIN increments attempts; 6th attempt → `PIN_LOCKED`.
- Two sessions on one table at once → unique index violation.
- Anon cannot execute staff RPCs.

### 12.4 Concurrency test (`tests/security/race.test.ts`)
```ts
it("exactly one of 50 simultaneous bookings wins", async () => {
  const results = await Promise.allSettled(
    Array.from({ length: 50 }, (_, i) => asUser(i).rpc("create_booking", slotArgs))
  );
  const ok = results.filter(r => r.status === "fulfilled" && !r.value.error);
  expect(ok).toHaveLength(1);
});
```

### 12.5 E2E journeys (Playwright)
1. Guest browses → sees availability → clicks Book → redirected to login → returns to flow.
2. Customer books slot → sees PIN → copies → appears in profile.
3. **Two browser contexts:** A books slot; B (already on the page) sees it become booked without refresh.
4. Staff enters PIN → table running → customer context sees timer.
5. Staff adds extra time → bill updates.
6. Walk-in booking blocks slot on public site.
7. End session → bill → mark paid.
8. Customer navigates to `/staff` and `/owner` → redirected/403.
9. Wrong PIN ×5 → locked message.
10. QR order with no session → blocked; with session → appears in kitchen.
11. Owner exports PDF and Excel → files download and contain expected totals.
12. Offline/online resilience: drop network, restore, availability resyncs.

### 12.6 Cyber-attack test cases (automated where possible)
| Test | Expectation |
|---|---|
| `<script>alert(1)</script>` in name, notes, menu item, site content | Rendered as text; no execution |
| `' OR 1=1 --` in search/filter fields | Treated as literal; no error leakage |
| Change `booking_id` in URL/API to another user's | 403/empty |
| Call `create_booking` with `p_source='offline'` as customer | `FORBIDDEN` |
| Tamper price/amount in request payload | Ignored; server recomputes |
| Replay old/forged QR token; token from table 1 on table 2 | Rejected |
| 100 rapid login attempts | Rate-limited (429) |
| 20 bookings in a minute from one account | Rate-limited |
| `next=https://evil.com` on login callback | Falls back to `/` |
| Export cell value `=HYPERLINK(...)` | Neutralised with leading `'` |
| Request admin export as staff | 403 |
| Use service-role key from browser bundle | Not present (bundle grep in CI: `grep -r "service_role" .next/static` must be empty) |
| Large payloads / deep JSON | Rejected by size limits |
| Missing/invalid JWT on RPC | `UNAUTHENTICATED` |

### 12.7 Manual QA matrix
| Dimension | Coverage |
|---|---|
| Devices | iPhone Safari, Android Chrome, iPad (staff), desktop Chrome/Edge/Firefox |
| Network | Fast 4G, Slow 3G, offline blip |
| Time | Midnight rollover, IST vs device timezone mismatch, slot at day boundary |
| Data | 0 bookings, 1 booking, full day booked, 500 bookings |
| Accessibility | Keyboard-only flow, screen reader pass on booking flow, 200 % zoom |

---

## 13. Dead Code & Dead File Elimination

Automated, enforced in CI so it stays clean — not a one-time chore.

### 13.1 Tooling
| Tool | Finds |
|---|---|
| **knip** | Unused files, exports, dependencies, devDependencies, unlisted/unresolved imports |
| `depcheck` (backup) | Unused packages |
| `ts-prune` / `tsc --noUnusedLocals --noUnusedParameters` | Unused exports/locals |
| ESLint `no-unused-vars`, `import/no-unused-modules`, `unused-imports` | Unused imports/variables |
| `next build` bundle analyzer (`@next/bundle-analyzer`) | Unused heavy deps in the bundle |
| `git ls-files` vs reference graph | Orphan assets in `public/` |
| SQL review | Unused tables, columns, functions, indexes |

### 13.2 `knip.json`
```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": ["src/app/**/{page,layout,route,error,not-found,loading}.tsx", "src/middleware.ts", "next.config.ts", "tests/**/*.ts"],
  "project": ["src/**/*.{ts,tsx}", "tests/**/*.ts"],
  "ignoreDependencies": ["tailwindcss", "postcss"]
}
```

### 13.3 `tsconfig` strictness
```json
{ "compilerOptions": { "strict": true, "noUnusedLocals": true, "noUnusedParameters": true,
  "noUncheckedIndexedAccess": true, "noImplicitOverride": true, "forceConsistentCasingInFileNames": true } }
```

### 13.4 Package scripts
```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "dead": "knip --no-progress",
    "audit": "pnpm audit --prod --audit-level=high",
    "verify": "pnpm lint && pnpm typecheck && pnpm test && pnpm dead && pnpm audit && pnpm build"
  }
}
```

### 13.5 Manual final sweep checklist
- [ ] Run `pnpm dead` → **zero** unused files/exports/dependencies reported.
- [ ] Delete: starter boilerplate (`create-next-app` default SVGs, sample pages, `vercel.svg`, `next.svg`), unused shadcn components, unused fonts, unused images in `public/`.
- [ ] Delete leftover mock/seed data modules (e.g. `mockData.ts`, hard-coded demo users) from the production bundle; seed lives only in `supabase/seed.sql` (staging).
- [ ] Remove all `console.log`, `debugger`, commented-out blocks, `TODO`/`FIXME` without ticket (`grep -rn "console.log\|debugger\|TODO\|FIXME" src` → empty or ticketed).
- [ ] Remove duplicate components/utilities (search for near-identical names).
- [ ] Remove unused env vars from `.env.example` and Vercel settings.
- [ ] Drop unused DB objects (tables/columns/functions) via a new migration — never edit applied migrations.
- [ ] Remove unused npm scripts and unused config files (e.g. leftover `.eslintrc.*` if using flat config).
- [ ] Confirm no secrets or `.env` committed (`gitleaks detect`).
- [ ] Confirm `.gitignore` covers `.next`, `node_modules`, `.env*`, `coverage`, `playwright-report`.
- [ ] Final `pnpm verify` passes from a **clean clone** (`git clone` → `pnpm i --frozen-lockfile` → `pnpm verify`).
- [ ] Bundle review: no unexpectedly large dependency; initial JS on home ≤ 170 KB gzip.

> Only delete after tests pass before and after; commit the cleanup as its own commit (`chore: remove dead code and files`) so it can be reverted cleanly.

---

## 14. CI/CD & Deployment

### 14.1 Environments
| Env | Supabase | Vercel | Data |
|---|---|---|---|
| Local | `supabase start` | `pnpm dev` | seed.sql |
| Staging | separate project | Preview deployments | seed.sql (fake data) |
| Production | separate project | Production | Real; **no seed** |

### 14.2 `ci.yml` (summary)
```yaml
name: CI
on: [pull_request, push]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm dead
      - run: pnpm audit
      - run: pnpm build
      - run: "! grep -r 'service_role' .next/static"       # key must never reach the browser
  db:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase start && supabase test db            # pgTAP
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
```

### 14.3 Production setup checklist
- [ ] Supabase: Google provider configured with production redirect URLs; email confirmations on; leaked-password protection on; JWT expiry 1 h; SMTP configured (custom domain).
- [ ] Supabase: daily backups + Point-in-Time Recovery enabled; test one restore.
- [ ] Supabase: Realtime enabled for `booked_slots`, `game_tables`, `sessions`, `orders` only.
- [ ] Vercel: env vars set (Production scope only for service key); domain + HTTPS; HSTS on.
- [ ] DNS: A/CNAME, SPF/DKIM/DMARC for email.
- [ ] Sentry configured with release tracking; alert on error spike.
- [ ] Uptime monitor (Better Stack/UptimeRobot) on `/` and a `/api/health` endpoint (checks DB reachability).
- [ ] Create **real** owner account with strong unique password + MFA; create staff accounts via owner UI.
- [ ] Seed only production reference data: tables, pricing, menu (via owner settings or a one-time migration — not demo users).
- [ ] Legal pages: Privacy Policy, Terms, Cancellation/No-show policy (India DPDP Act-aware: consent, purpose, data deletion contact).
- [ ] Staging → Production promotion through Git tag; rollback = Vercel "Promote previous deployment" (< 1 min); DB changes always backward-compatible for one release.

---

## 15. Launch-Day Runbook

| Time | Action | Owner | Gate |
|---|---|---|---|
| T-24h | Freeze scope to **Tier 1**. All Tier 2 behind `FEATURE_*` flags (default off). | Lead | Scope signed off |
| T-12h | Stages 0–5 + 7 complete on staging | Devs | Done-when ticked |
| T-8h | Security checklist §11.7 complete | Security | All ✅ |
| T-6h | Full test suite + concurrency + load test on staging | QA | All green, p95 < 800 ms |
| T-5h | Dead-code sweep §13, clean-clone `pnpm verify` | Dev | 0 findings |
| T-4h | Production DB migrated, real owner + staff accounts created, MFA on | Lead | Verified login |
| T-3h | Deploy to production, smoke tests (below) | Dev | Pass |
| T-2h | **Staff training:** 15-min walkthrough on tablet (PIN, +time, walk-in, paid). Print a one-page cheat-sheet. | Owner | Staff can run a session unaided |
| T-1h | **Go/No-Go meeting** (any failed Tier 1 item = No-Go) | All | Decision |
| T-0 | Announce; keep **paper fallback** at the desk | Owner | |
| T+1h → T+24h | Watch Sentry, Supabase logs, uptime; one person on call | Dev | No P1 open |

### Production smoke test (run with real accounts)
1. Sign up with Google → profile exists.
2. Book a table 2 hours ahead → PIN shown.
3. Second browser: slot shows booked within 2 s.
4. Staff: start session with PIN → timer on both screens.
5. Add 15 min → bill updates.
6. End → pay → appears in reports.
7. Cancel a test booking → slot frees live.
8. Delete test data (via owner tool) so reports start clean.

### Rollback plan
- App: Vercel instant rollback.
- DB: forward-fix migration; PITR restore only as last resort.
- Operational: staff switch to paper + manual stopwatch; owner reconciles afterward.

---

## 16. Edge Cases Register

| Case | Handling |
|---|---|
| Two users book same slot simultaneously | DB exclusion constraint; loser sees friendly conflict + refreshed availability |
| Wrong / reused PIN | Clear error, attempt counter, lock at 5, owner unlock |
| PIN lost | "Reveal PIN" in profile (owner of booking only) rotates and shows new PIN |
| Customer late / no-show | Auto `no_show` after 15 min (cron) → slot freed live; configurable in settings |
| Customer early | Allow check-in ≥ 15 min before start if table free; else queue |
| Page refresh mid-session | Timer derived from DB `started_at` |
| Phone clock wrong | Server clock offset applied |
| QR order with no running session | Blocked with friendly message |
| Extra time collides with next booking | Warn; staff can force or decline |
| Internet down at venue | Staff PWA caches floor view read-only; paper fallback; no offline writes (avoids conflicts) |
| Session ends past booked end | Overage billed per-minute at current rate |
| Table goes into maintenance with future bookings | Owner action lists affected bookings → reschedule/cancel flow with notification |
| Price changes mid-booking | `amount` snapshotted at booking; order prices snapshotted |
| Daylight/timezone | Store `timestamptz`, render in `Asia/Kolkata`, slot math in `lib/time.ts` only |
| Duplicate submit (double-click) | Button disabled + idempotency key on `create_booking` |
| Staff deletes menu item used in past orders | Soft-disable (`available=false`), never hard delete |
| Refund/cancellation | Cancel frees slot; financial adjustments recorded in `audit_log` (payments are offline in v1) |

---

## 17. Post-Launch Roadmap
1. WhatsApp / SMS reminders (T-2h) and no-show nudges.
2. Online payments (UPI/cards via Razorpay) with webhook-verified status.
3. Memberships, loyalty points, referral codes.
4. Dynamic / peak pricing rules in owner settings.
5. Tournament & event booking, leaderboards.
6. Café inventory tracking and low-stock alerts.
7. Multi-venue support (add `venue_id` to core tables).
8. Native-feel PWA install for staff tablets.

---

## 18. Definition of Done

**The project is "live and production-ready" only when every box is ticked:**

### Functionality
- [ ] Customer can sign up, book, get PIN, see booking in profile
- [ ] Booking appears as **booked for everyone else in ≤ 2 s** with no refresh
- [ ] 50-way concurrent booking test → exactly 1 winner
- [ ] Staff can start session via PIN; timer identical on staff + customer
- [ ] Extra time, end session, combined bill, mark paid all correct
- [ ] Walk-in bookings block slots like online ones
- [ ] (Tier 2) QR order → kitchen → bill; owner analytics, calendar, expenses, exports

### Security
- [ ] RLS on every table; cross-user access tests pass
- [ ] No role escalation; staff/owner routes inaccessible to customers
- [ ] CSP + security headers (grade A); rate limits active; Turnstile on signup
- [ ] No secrets in repo/bundle; production has no demo accounts; MFA on owner
- [ ] `pnpm audit` clean (no high/critical); ZAP baseline clean

### Quality
- [ ] Unit, DB, integration, E2E, concurrency, load, a11y suites green
- [ ] Lighthouse mobile ≥ 90; staff UI verified on a real tablet
- [ ] Error monitoring + uptime alerts live; backups verified

### Cleanliness
- [ ] `knip` reports zero unused files/exports/dependencies
- [ ] No `console.log`, `debugger`, commented-out code, orphan assets, starter boilerplate
- [ ] `pnpm verify` passes from a clean clone
- [ ] Repo tree matches §6 exactly

### Operations
- [ ] Staff trained; paper fallback at desk; on-call person assigned
- [ ] Legal pages published; domain + HTTPS + email auth (SPF/DKIM/DMARC) configured

---

*End of Master Blueprint — Cue Nation v1.0*
