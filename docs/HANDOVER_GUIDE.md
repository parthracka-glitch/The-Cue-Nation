# QNation — Client Handover & Operations Guide

## 1. System Requirements & Prerequisites

To run and deploy QNation, the host environment must meet the following specifications:
- **Node.js**: `v18.18.0` or higher (`v20.x LTS` recommended).
- **Package Manager**: `npm` (v9+) or `pnpm`.
- **Operating System**: Linux, macOS, or Windows 10/11.
- **Port Requirement**: Port `3000` (default) or configurable via `PORT` environment variable.

---

## 2. Local Setup & Quick Start

### Step 1: Clone and Enter the Directory
```bash
git clone https://github.com/parthracka-glitch/The-Cue-Nation.git
cd The-Cue-Nation
```

### Step 2: Configure Environment Variables
Copy the sanitized environment template:
```bash
cp .env.example .env.local
```
Review `.env.local` to ensure required variables have suitable development placeholders.

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Available NPM Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with hot-reload |
| `npm run build` | Compiles full production build across all 71 routes |
| `npm run start` | Launches optimized production server |
| `npm run typecheck` | Executes TypeScript type checking (`tsc --noEmit`) |
| `npm test` | Runs all 38 Vitest unit, service, and billing test suites |
| `npm run test:e2e` | Executes the 48-assertion end-to-end integration and negative test suite |
| `npm run lint` | Runs Next.js ESLint static code analysis |

---

## 4. Database Setup & Production Integration (Next Steps)

> [!IMPORTANT]
> The database is currently running on the authoritative in-memory state engine (`src/lib/services/dataStore.ts`).
> Production persistence requires connecting MongoDB or Managed PostgreSQL (Supabase).

### Option A: MongoDB Configuration
1. Provision a MongoDB cluster (e.g., MongoDB Atlas).
2. Set the connection string in `.env.local`:
   ```bash
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/qnation?retryWrites=true&w=majority
   ```
3. Map the Mongoose/MongoDB schemas to the domain models defined in `src/types/database.ts`.

### Option B: Supabase / PostgreSQL Configuration
The repository already contains complete SQL migrations:
1. Apply migrations from `supabase/migrations/` to your database.
2. Seed initial data using `supabase/seed.sql`.
3. Provide Supabase credentials in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## 5. Portal Access & Default Credentials

| Portal | Route | Default Credentials | Privileges |
| :--- | :--- | :--- | :--- |
| **Customer** | `/` | None required | Browse games, check slot availability, make booking, view PIN |
| **Staff Floor** | `/staff/login` | Staff ID: `STF-101` / Pass: `staff123` | Table management, PIN check-in, floor timers, Café POS, billing |
| **Executive Admin** | `/admin/login` | Admin ID: `ADM-001` / Pass: `admin123` | Executive dashboard, rate configuration, reports, audit logs |

---

## 6. Known Limitations & Scope Disclosures

1. **In-Memory State Lifespan**: Until MongoDB or PostgreSQL is attached, bookings, active sessions, and café orders reset when the server process is restarted.
2. **Payment Gateway Webhooks**: Pay-at-venue and manual UPI verification are fully simulated. Connecting a live payment provider (Razorpay / Stripe) requires setting active webhook secrets in `.env.local`.
3. **SMS / WhatsApp Gateway**: WhatsApp bill sharing formats the bill text and triggers the WhatsApp Web/API intent link. For direct server-to-phone WhatsApp notifications, connect a WhatsApp Business API provider (Twilio or Meta Cloud API).

---

## 7. Troubleshooting Common Issues

### Issue 1: Port 3000 Already in Use
**Solution**: Run on an alternate port:
```bash
npm run dev -- -p 3001
```

### Issue 2: Redirected to Login when accessing `/staff` or `/admin`
**Reason**: Edge middleware requires valid authentication cookies.
**Solution**: Visit `/staff/login` or `/admin/login` and sign in with the default credentials above.

### Issue 3: Typecheck or Build Fails After Edits
**Solution**: Run `npm run typecheck` to pinpoint interface mismatches, followed by `npm test`.
