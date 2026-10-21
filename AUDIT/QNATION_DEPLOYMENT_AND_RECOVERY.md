# QNATION — PRODUCTION DEPLOYMENT, BACKUP & DISASTER RECOVERY GUIDE
**System:** QNation Venue Operations Platform  
**Target Architecture:** Next.js 15, Node.js 20+, MongoDB / In-Memory Synchronized Store  
**Author:** Principal Full-Stack Architect & DevOps Lead  
**Date:** 2026-10-21  

---

## 1. Production Hosting & System Requirements

### Minimum Hardware Specification:
- **Server:** 2 vCPU, 4 GB RAM, 20 GB SSD storage.
- **Runtime:** Node.js v20.x or higher, npm v10.x.
- **Database:** MongoDB 6.0+ (Replica Set recommended for transactions) or MongoDB Atlas M10+.
- **Client Devices:** iPad Air / 10th Gen, Galaxy Tab S6 Lite+, or Windows 11 counter terminal.

---

## 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
# Venue Identity
NEXT_PUBLIC_APP_NAME="QNation Pool & Snooker Lounge"
NEXT_PUBLIC_APP_URL="https://app.cuenation.in"
NEXT_PUBLIC_VENUE_TIMEZONE="Asia/Kolkata"

# Database Configuration
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/qnation?retryWrites=true&w=majority"
MONGODB_DB_NAME="qnation"

# Authentication & Session Security
JWT_SECRET="<generate_secure_random_64_char_secret>"
NEXTAUTH_SECRET="<generate_secure_random_64_char_secret>"
NEXTAUTH_URL="https://app.cuenation.in"

# Payment Gateways (Optional / Sandbox defaults provided)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."

# Customer Communication (WhatsApp Business Cloud API)
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_VERIFY_TOKEN=""
```

---

## 3. Production Build & Process Management

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Validate TypeScript & Test Suite
```bash
npx tsc --noEmit
npm test
```

### Step 3: Compile Production Next.js Bundle
```bash
npm run build
```

### Step 4: Launch via PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start npm --name "qnation-production" -- start -- -p 3000
pm2 save
pm2 startup
```

---

## 4. Automated Database Backup Strategy

QNation includes pre-built PowerShell backup and restoration automation located in the `scripts/` directory.

### Daily Backup Execution:
```powershell
.\scripts\backup.ps1 -OutputDir "backups" -RetentionDays 30
```

### Backup Capabilities:
1. **Automated Detection:** Detects `mongodump` CLI on PATH; if MongoDB URI is configured, exports a compressed `.archive` binary snapshot.
2. **JSON Fallback:** If running in synchronized storage mode, exports an encrypted JSON snapshot.
3. **Retention Pruning:** Automatically deletes snapshots older than 30 days to prevent disk exhaustion.

---

## 5. Disaster Recovery & Rollback Procedure

### Recovery Time Objective (RTO): < 15 minutes  
### Recovery Point Objective (RPO): < 24 hours (or hourly if cron scheduled)

### Step 1: Dry-Run Inspection
Validate the archive without committing changes to disk:
```powershell
.\scripts\restore.ps1 -BackupFile "backups\qnation_backup_20261021_120000.json" -DryRun
```

### Step 2: Execute Production Restore
```powershell
.\scripts\restore.ps1 -BackupFile "backups\qnation_backup_20261021_120000.json" -Force
```

### Step 3: Health-Check Verification
Ping the health verification endpoint:
```bash
curl http://localhost:3000/api/health
```
Ensure HTTP `200 OK` is returned with status `"healthy"`.

---

## 6. Official WhatsApp Business Platform Activation

For authorized automated WhatsApp messages (without manual click-to-chat):
1. Create a Meta for Developers account at `https://developers.facebook.com`.
2. Set up a **WhatsApp Business App** and link the venue's official phone number.
3. Configure the webhook callback URL: `https://app.cuenation.in/api/webhooks/whatsapp`.
4. Provide the permanent system user access token in `WHATSAPP_ACCESS_TOKEN`.
5. Once configured, QNation will automatically emit official template notifications for booking confirmations, reminders, and table readiness without staff manual intervention.
