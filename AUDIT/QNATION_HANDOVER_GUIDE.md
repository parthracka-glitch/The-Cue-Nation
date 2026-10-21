# QNATION — CLIENT & STAFF OPERATIONAL HANDOVER GUIDE
**Venue:** QNation Pool & Snooker Arena & Café Lounge  
**Audience:** Non-Technical Venue Owners, Floor Managers, and Operations Staff  
**Version:** 1.0.0 (Production Release)  

---

## Welcome to QNation!

This system is custom-crafted to run your 6 physical tables (**3 Pool, 3 Snooker**) with zero friction. You never need to touch computer code or edit databases. Everything is controlled through your touch-friendly **Staff Portal** and secure **Admin Console**.

---

## 1. Opening the Venue (Morning Shift Routine)

1. **Log In to the Staff Portal:**
   - Open Chrome or Safari on your tablet or desktop terminal: `http://<your-venue-ip>:3000/staff`.
   - Enter your Staff PIN or email credentials.
2. **Review the Live Floor Dashboard (`/staff/dashboard`):**
   - Confirm all 6 tables display the correct status:
     - 🟢 **Available (Free):** Ready for walk-in or booked customers.
     - 🟡 **Booked:** Has an upcoming reservation.
     - 🔴 **Active (Running):** Live timer active.
     - ⚙️ **Maintenance:** Offline for cloth leveling or cue repair.
3. **Inspect the Daily Table Timeline (`/staff/timeline`):**
   - View scheduled reservations across the 15-hour day (10:00 AM to 01:00 AM).
   - Check if any maintenance blocks are scheduled.
4. **Tablet Mode (Optional):**
   - If using an iPad or Android counter tablet, tap **Tablet Mode** in the top navigation bar for oversized touch buttons and simplified menus.

---

## 2. Serving Customers with Online Bookings (PIN Check-In)

When a player arrives and says: *"I booked online, my PIN is 482190"*:

1. On the **Staff Dashboard**, tap the **PIN Check-In** box or go to `/staff/bookings`.
2. Type or paste the customer's 6-digit PIN.
3. Tap **Validate & Check In**.
4. The system automatically:
   - Validates the reservation time and game type (Pool or Snooker).
   - Assigns an available table of that exact discipline.
   - Starts the live session clock.
5. Direct the customer to their assigned table (e.g., *Pool Table 2*).

---

## 3. Serving Walk-In Customers (Direct Table Allocation)

When players walk in without a prior reservation:

1. Tap **New Walk-in Game** on the Staff Dashboard.
2. Enter:
   - **Player Name** (e.g., *Rajesh K.*).
   - **Mobile Number** (e.g., *9876543210*).
   - **Discipline:** Select **Pool** (₹350/hr) or **Snooker** (₹500/hr).
   - **Duration:** 30 min, 60 min, 90 min, or 120 min.
   - **Payment Preference:** Pay Now or Pay at Finish.
3. Tap **Confirm & Allocate Table**.
   - If a table is free, the system immediately starts the game and displays the allocated table.
   - If all 3 tables of that discipline are full, the system prompts:
     *"All 3 Pool tables occupied. Would you like to add the customer to the Waiting List?"*

---

## 4. Full Venue & Waiting List Queue (`/staff/waiting-list`)

If the lounge is full:

1. Tap **Add to Waiting List**.
2. Enter the customer's name, phone, and preferred game.
3. The queue displays an **Estimated Wait Time** calculated automatically based on how many minutes remain on active tables.
4. When a table frees up:
   - Tap **Notify via WhatsApp** to alert the customer that their table is ready.
   - Tap **Seat Player** to instantly start their session.

---

## 5. Adding Extra Time to an Active Session

If a customer asks to play longer:

1. Locate the table card on the Live Floor Dashboard.
2. Tap **+30 Min** or **+60 Min**.
3. The system checks upcoming bookings to ensure the table isn't reserved by someone else immediately after.
4. The elapsed timer and billable total update automatically.

---

## 6. Completing a Session & Generating the Bill (`/staff/billing`)

When a game ends:

1. Tap **End Session** on the table card.
2. The table immediately turns green (**Available**) for new players.
3. The **Professional Bill Modal** appears with:
   - Table name, player name, start/end timestamps, billable minutes.
   - Time charges + any café drinks or snacks ordered.
   - Applicable discounts & 5% GST.
   - Net Amount Payable.
4. Collect payment: Tap **Cash**, **UPI**, or **Card**.
5. Tap **Download PDF** to save or print an A4 receipt.
6. Tap **Share on WhatsApp** to launch WhatsApp Web with a pre-filled, polished invoice summary for the customer.

---

## 7. Handing Over Shifts (`/staff/handover`)

When your duty shift ends and the next staff member arrives:

1. Open **Shift Handover** (`/staff/handover`).
2. Count the physical cash in the drawer and type the amount into **Counted Physical Drawer Cash**.
3. The screen immediately displays the **Cash Variance**:
   - `₹0 (Balanced)`
   - `+₹... (Surplus)`
   - `-₹... (Shortage)`
4. Add any operational notes (e.g., *"Table 3 chalk replenished, VIP customer arriving at 8 PM"*).
5. Tap **Sign & Submit Shift Handover**.
6. The incoming staff member logs in, reviews the count, and taps **Acknowledge as Incoming Staff**.

---

## 8. Closing the Day (`/staff/closing`)

At end of night operations (e.g., 01:00 AM):

1. Go to **Daily Closing** (`/staff/closing`).
2. Review the daily ledger:
   - Total sessions completed.
   - Total revenue split across Cash, UPI, Card, and Online.
   - Outstanding balances.
3. Enter the final cash drawer count.
4. Tap **Submit Daily Closing Report**.
5. The owner reviews and taps **Approve Closing** in the Admin Console (`/admin/closing`).

---

## 9. Venue Troubleshooting FAQ

### What if the internet disconnects?
- QNation keeps running locally on your venue's WiFi network. You can continue starting sessions, running timers, and taking cash or UPI payments. Data synchronizes automatically once the connection restores.

### What if a customer types an invalid PIN?
- The system prevents unauthorized check-ins and displays a clear message. Staff can look up the customer by mobile number in **Customer Directory** (`/staff/customers`) and check them in manually.

### Can a bill be printed twice without duplicating revenue?
- **Yes.** Bill generation and reprinting are strictly idempotent. Reopening a bill never creates a duplicate payment record or doubles the revenue in your daily reports.

### What if table cloth or equipment is damaged?
- Go to **Maintenance** (`/staff/maintenance`). Tap **Report Maintenance Issue**, select the table, and check **Mark Table Offline**. If a booking is scheduled on that table, the system warns you so you can reassign the customer first.
