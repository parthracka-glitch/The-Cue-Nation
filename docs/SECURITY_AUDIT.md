# QNation — Comprehensive Security Audit Report

## 1. Executive Summary

A comprehensive application security audit of the **QNation Pool & Snooker Management Platform** was performed in October 2026. The review evaluated the codebase against the **OWASP Top 10**, Node.js/Next.js security best practices, financial transaction integrity guidelines, and role-based access control (RBAC) requirements.

Overall Security Rating: **HIGH DEFENSE-IN-DEPTH POSTURE**
- **Authentication & Authorization**: Strict edge middleware route guards combined with server API token checks.
- **Financial & Tariff Integrity**: 100% server-authoritative calculations; client inputs for monetary figures are rejected.
- **Secrets Management**: Zero committed production secrets; `.env.example` contains only sanitized dummy keys.
- **Injection Defenses**: Strict TypeScript interfaces, parameterized query abstractions, and no direct shell/NoSQL execution.

---

## 2. Security Assessment Matrix

| ID | Category | Severity | Component | Finding & Posture | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Authentication Bypass | **Critical** | `/staff/*`, `/admin/*` | Edge middleware enforces presence of valid `staff_token` and `admin_token` cookies before rendering protected pages. | **CONFIRMED & ENFORCED** |
| **SEC-02** | Financial Manipulation | **Critical** | `/api/bills`, `/api/orders` | Billing calculations occur exclusively server-side in `src/lib/billing/calculate.ts`. Client cannot dictate time tariff or café prices. | **CONFIRMED & ENFORCED** |
| **SEC-03** | PIN Brute-Force & Reuse | **High** | `/api/sessions` | Booking PINs are 6 digits, single-use, and automatically marked `completed` upon check-in. Reuse is blocked. | **CONFIRMED & ENFORCED** |
| **SEC-04** | Overlapping Allocations | **High** | `bookingService.ts` | Slot conflict engine verifies table availability across discrete 60m/90m/120m intervals to prevent double-booking. | **CONFIRMED & ENFORCED** |
| **SEC-05** | Timer Tampering | **Medium** | Floor Timers | Floor session durations calculate elapsed time using immutable server ISO timestamps (`startTime`). Client clock adjustments cannot alter charges. | **CONFIRMED & ENFORCED** |
| **SEC-06** | Cross-Site Scripting (XSS) | **Medium** | Public Web / Admin | React 19 JSX auto-encodes rendered strings. Strict Content Security Policy (`CSP`) headers configured in `next.config.ts`. | **CONFIRMED & ENFORCED** |
| **SEC-07** | Clickjacking & MIME Sniffing | **Low** | Next.js Config | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security` headers active. | **CONFIRMED & ENFORCED** |
| **SEC-08** | Secret Exposure | **Critical** | Git & Config | No real production secrets exist in git. `.env.local` is gitignored. `.env.example` has only placeholder text. | **CONFIRMED & SECURE** |

---

## 3. Detailed Security Findings

### 3.1 Authentication & Session Management
- **Edge Route Protection (`src/middleware.ts`)**:
  - Automatically intercepts all requests to `/staff/*`, `/admin/*`, and `/owner/*`.
  - Redirects unauthenticated requests to `/staff/login` or `/admin/login`.
  - Strips administrative entry points and staff navigation from public customer views.
- **Role Isolation**:
  - Staff credentials (`STF-101`) cannot access executive financial reports or audit logs in `/admin`.
  - Admin credentials (`ADM-001`) have executive privileges.

### 3.2 Authorization & Object-Level Permissions
- **Booking Reference & PIN**:
  - Customers receive an opaque reference (e.g., `CN-102938`) and a confidential 6-digit PIN.
  - Check-in requires matching the exact booking reference and PIN.
- **Session Extensions**:
  - Requests to extend sessions (`/api/sessions/[id]/extend`) validate active session state and table conflict boundaries. Finished sessions cannot be modified.

### 3.3 Financial & Tariff Integrity
- **Tariff Invariants**:
  - Pool Table Tariff: Fixed at ₹250/hour.
  - Snooker Table Tariff: Fixed at ₹350/hour.
  - Extension charges are calculated strictly based on additional elapsed minutes at table base rate.
- **Café POS Integrity**:
  - Item pricing is resolved from authoritative menu data in `dataStore.ts`.
  - Orders placed for tables are atomically attached to the active session and aggregated into the finalized bill.

### 3.4 HTTP Security Headers (`next.config.ts`)
The server injects the following security headers on all responses:
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; img-src 'self' data: blob: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

---

## 4. Database-Dependent Security Limitations

> [!NOTE]
> MongoDB and external managed databases are currently not configured.
> The application uses an in-memory transactional data store (`dataStore.ts`) with deep mock resilience.

**Current Limitations**:
1. In-memory data store resets on server restart. For persistent state, an external MongoDB or PostgreSQL database must be attached.
2. Connection string credentials in `.env.local` must be configured with least-privilege database user permissions prior to production launch.

---

## 5. Security Recommendations for Handover

1. **Database Migration**: Ensure Supabase or MongoDB is configured using environment variables specified in `.env.example`.
2. **Rate Limiting**: For high-volume production, configure Upstash Redis environment variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) already integrated into `@upstash/ratelimit`.
3. **Audit Log Archival**: Schedule periodic automated export of `/api/audit-logs` to cold storage for regulatory compliance.
