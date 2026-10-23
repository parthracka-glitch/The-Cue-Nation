/**
 * CueNation Comprehensive Automated End-to-End Test Suite
 * Validates the complete Customer -> Staff -> Admin workflow with negative security cases.
 */

const BASE_URL = 'http://localhost:3000';

async function runE2ETests() {
  console.log('================================================================');
  console.log('🎯 CUENATION AUTOMATED END-TO-END VALIDATION SUITE');
  console.log('================================================================\n');

  let testPassedCount = 0;
  let testFailedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      testPassedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      testFailedCount++;
      throw new Error(`Assertion Failed: ${message}`);
    }
  }

  try {
    // Setup: Reset test fixture on main-pool for test isolation
    await fetch(`${BASE_URL}/api/health`, { method: 'POST' });

    // 1. Customer browses available slots for Main Pool
    console.log('1. Querying live slots for Main Pool (60 min)...');
    const scheduleRes = await fetch(`${BASE_URL}/api/pools/main-pool?duration=60`);
    assert(scheduleRes.status === 200, 'Schedule API returned 200 OK');
    const scheduleData = await scheduleRes.json();
    const availableSlot = scheduleData.schedule.slots.find((s) => s.status === 'available');
    assert(!!availableSlot, `Found available slot: ${availableSlot?.startTimeLabel} - ${availableSlot?.endTimeLabel}`);

    // 2. Customer submits booking
    console.log('2. Submitting customer booking...');
    const bookingPayload = {
      tableId: 'main-pool',
      startISO: availableSlot.startISO,
      endISO: availableSlot.endISO,
      guestName: 'Ananya Deshmukh',
      guestPhone: '+91 98200 54321',
      guestEmail: 'ananya@example.com',
      durationMinutes: 60,
      price: availableSlot.price,
      source: 'online'
    };

    const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    assert(bookRes.status === 201, 'Booking API returned 201 Created');
    const bookData = await bookRes.json();
    const bookingCode = bookData.booking?.booking_code;
    const pin = bookData.rawPin || bookData.pin;
    const bookingId = bookData.booking?.id;

    assert(!!bookingCode && bookingCode.startsWith('CN-'), `Received valid Booking Code: ${bookingCode}`);
    assert(!!pin && pin.length === 6, `Generated confidential 6-digit PIN: ${pin}`);
    assert(bookData.booking?.amount === 350, 'Authoritative price calculated server-side: ₹350');

    // -------------------------------------------------------------------------
    // PHASE 4: STAFF LOGIN & BOOKING DISCOVERY
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 4: STAFF LOGIN & BOOKING DISCOVERY ---');

    // 3. Staff authenticates
    console.log('3. Staff logging in with individual credentials (STF-101)...');
    const staffLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'staff',
        identifier: 'STF-101',
        password: 'StaffPassword123!'
      })
    });
    assert(staffLoginRes.status === 200, 'Staff login returned 200 OK');
    const staffLoginData = await staffLoginRes.json();
    const staffToken = staffLoginData.token;
    assert(!!staffToken, 'Received staff session token');
    assert(staffLoginData.user?.role === 'manager', 'Staff role correctly set to manager');

    // 4. Staff finds the booking in the backend
    console.log('4. Staff discovering booking on floor list...');
    const staffBookingsRes = await fetch(`${BASE_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    const staffBookingsData = await staffBookingsRes.json();
    const matchedBooking = staffBookingsData.bookings.find((b) => b.booking_code === bookingCode);
    assert(!!matchedBooking, `Booking ${bookingCode} discovered on staff floor roster`);
    assert(matchedBooking?.status === 'confirmed', 'Initial booking status is confirmed');

    // -------------------------------------------------------------------------
    // PHASE 5: PIN VERIFICATION & TABLE ALLOCATION
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 5: PIN VERIFICATION & TABLE ALLOCATION ---');

    console.log(`5. Customer arrives at venue. Staff enters PIN (${pin}) for table allocation...`);
    const checkInRes = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        tableId: 'main-pool',
        bookingCode: bookingCode,
        pin: pin
      })
    });
    assert(checkInRes.status === 201, 'Check-in API returned 201 Created');
    const sessionData = await checkInRes.json();
    const activeSession = sessionData.session;
    assert(!!activeSession?.id, `Active session created with ID: ${activeSession?.id}`);
    assert(activeSession?.table_id === 'main-pool', 'Allocated table is main-pool');
    assert(!!activeSession?.started_at, `Authoritative start timestamp recorded: ${activeSession?.started_at}`);

    // Verify table status flipped to running
    const tablesRes = await fetch(`${BASE_URL}/api/tables`);
    const tablesData = await tablesRes.json();
    const mainPoolTable = tablesData.tables.find((t) => t.id === 'main-pool');
    assert(mainPoolTable?.status === 'running', 'Main Pool table status flipped to running');

    // -------------------------------------------------------------------------
    // PHASE 6: TIMER & SESSION CONTROL
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 6: TIMER & SESSION CONTROL ---');

    console.log('6. Validating timer continuity after reload...');
    const sessionsRes = await fetch(`${BASE_URL}/api/sessions`);
    const sessionsList = await sessionsRes.json();
    const runningSession = sessionsList.sessions.find((s) => s.id === activeSession.id);
    assert(!!runningSession && !runningSession.ended_at, 'Session timer verified active on server');
    assert(runningSession.time_charge >= 350, 'Baseline table charge preserved: ₹350');

    // Staff extends session by 30 mins
    console.log('7. Staff extending session by +30 minutes...');
    const extendRes = await fetch(`${BASE_URL}/api/sessions/${activeSession.id}/extend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ extraMinutes: 30 })
    });
    assert(extendRes.status === 200, 'Session extension API returned 200 OK');
    const extendedData = await extendRes.json();
    assert(extendedData.session?.extra_minutes === 30, 'Extra minutes updated to 30m');
    assert(extendedData.session?.time_charge > 350, `Recalculated time charge with extension: ₹${extendedData.session?.time_charge}`);

    // -------------------------------------------------------------------------
    // PHASE 7: CAFÉ ORDERING DURING ACTIVE SESSION
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 7: CAFÉ ORDERING & BILL ATTACHMENT ---');

    console.log('8. Adding café food and beverages to active session...');
    const cafePayload = {
      sessionId: activeSession.id,
      tableId: 'main-pool',
      items: [
        { menuItemId: 'm-1', qty: 2 }, // Signature Cold Brew (2 x 180 = 360)
        { menuItemId: 'm-4', qty: 1 }  // Truffle Parmesan Fries (1 x 240 = 240)
      ]
    };

    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify(cafePayload)
    });
    assert(orderRes.status === 201, 'Café order API returned 201 Created');
    const orderData = await orderRes.json();
    const orderId = orderData.order?.id;
    assert(!!orderId, `Café Order created with ID: ${orderId}`);
    assert(orderData.subtotal === 600, 'Authoritative café subtotal calculated on server: ₹600 (2x180 + 1x240)');

    // Kitchen marks order as served
    console.log('9. Kitchen fulfilling and serving order...');
    const serveRes = await fetch(`${BASE_URL}/api/orders?orderId=${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({ status: 'served' })
    });
    assert(serveRes.status === 200, 'Order status updated to served');

    // -------------------------------------------------------------------------
    // PHASE 8: END SESSION & GENERATE FINAL CONSOLIDATED BILL
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 8: END SESSION & CONSOLIDATED BILLING ---');

    console.log('10. Staff concluding session and generating final bill...');
    const endRes = await fetch(`${BASE_URL}/api/sessions/${activeSession.id}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    assert(endRes.status === 200, 'End session API returned 200 OK');
    const endData = await endRes.json();
    const finalBill = endData.bill;
    assert(!!finalBill, 'Authoritative final bill generated');
    assert(finalBill.food_charge === 600, 'Bill includes served café food: ₹600');
    assert(finalBill.time_charge >= 525, `Bill includes pool & extension charges: ₹${finalBill.time_charge}`);
    assert(finalBill.total === finalBill.time_charge + finalBill.food_charge + (finalBill.tax_amount || 0), `Bill total reconciles: ₹${finalBill.total}`);
    assert(finalBill.paid === false, 'Initial bill payment status is unpaid');

    // Table should now be released back to free
    const tableAfterEnd = (await (await fetch(`${BASE_URL}/api/tables`)).json()).tables.find((t) => t.id === 'main-pool');
    assert(tableAfterEnd?.status === 'free', 'Main Pool table returned to free status');

    // Staff records payment
    console.log('11. Staff collecting payment via UPI...');
    const payRes = await fetch(`${BASE_URL}/api/bills?billId=${finalBill.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        billId: finalBill.id,
        payMode: 'upi',
        amountPaid: finalBill.total,
        referenceNumber: 'UPI-RAZORPAY-DEMO-9988'
      })
    });
    if (payRes.status !== 200) {
      console.error('PAY ERROR:', payRes.status, await payRes.text());
    }
    assert(payRes.status === 200, 'Bill payment API returned 200 OK');
    const payData = await payRes.json();
    assert(payData.bill?.paid === true, 'Bill status updated to paid');
    assert(payData.receipt?.reference === 'UPI-RAZORPAY-DEMO-9988', 'Receipt generated with payment reference');

    // -------------------------------------------------------------------------
    // PHASE 9: ADMIN DASHBOARD & BUSINESS OVERVIEW
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 9: ADMIN DASHBOARD & AUDIT VERIFICATION ---');

    console.log('12. Admin logging in with dedicated credentials...');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'admin',
        email: 'admin@cuenation.club',
        password: 'AdminPassword123!'
      })
    });
    assert(adminLoginRes.status === 200, 'Admin login returned 200 OK');
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    assert(!!adminToken, 'Received admin session token');

    // Verify booking status is completed in admin overview
    console.log('13. Admin verifying booking and financial reconciliation...');
    const adminBookingsRes = await fetch(`${BASE_URL}/api/bookings`);
    const adminBookings = (await adminBookingsRes.json()).bookings;
    const targetBookingAdmin = adminBookings.find((b) => b.booking_code === bookingCode);
    assert(targetBookingAdmin?.status === 'completed', 'Admin view confirms booking status is completed');

    // Verify audit logs exist for this workflow
    console.log('14. Inspecting immutable security audit logs...');
    const auditRes = await fetch(`${BASE_URL}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(auditRes.status === 200, 'Audit logs API accessible to admin');
    const auditData = await auditRes.json();
    const hasBookingLog = auditData.logs?.some((l) => l.action === 'BOOKING_CREATED');
    const hasSessionStartLog = auditData.logs?.some((l) => l.action === 'SESSION_STARTED');
    const hasOrderLog = auditData.logs?.some((l) => l.action === 'CAFE_ORDER_CREATED');
    const hasSessionEndLog = auditData.logs?.some((l) => l.action === 'SESSION_ENDED');
    const hasPaymentLog = auditData.logs?.some((l) => l.action === 'BILL_PAID_AND_SETTLED');

    assert(hasBookingLog, 'Audit log recorded: BOOKING_CREATED');
    assert(hasSessionStartLog, 'Audit log recorded: SESSION_STARTED');
    assert(hasOrderLog, 'Audit log recorded: CAFE_ORDER_CREATED');
    assert(hasSessionEndLog, 'Audit log recorded: SESSION_ENDED');
    assert(hasPaymentLog, 'Audit log recorded: BILL_PAID_AND_SETTLED');

    // -------------------------------------------------------------------------
    // PHASE 11.D: NEGATIVE & RECOVERY TESTS
    // -------------------------------------------------------------------------
    console.log('\n--- PHASE 11.D: NEGATIVE & RECOVERY TESTS ---');

    // 15. Attempt to reuse PIN from completed booking -> MUST FAIL
    console.log('15. Attempting to reuse PIN from completed booking...');
    const reusePinRes = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        tableId: 'main-pool',
        bookingCode: bookingCode,
        pin: pin
      })
    });
    assert(reusePinRes.status === 400, `Reusing completed PIN rejected with status ${reusePinRes.status}`);

    // 16. Attempt to finalize or pay already settled bill -> MUST FAIL
    console.log('16. Attempting to double-pay already settled bill...');
    const doublePayRes = await fetch(`${BASE_URL}/api/bills?billId=${finalBill.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        billId: finalBill.id,
        payMode: 'cash',
        amountPaid: finalBill.total
      })
    });
    assert(doublePayRes.status === 400, `Double-payment attempt rejected with status ${doublePayRes.status}`);

    // 17. Attempt unauthorized staff login with wrong password -> MUST FAIL
    console.log('17. Testing brute-force / wrong password rejection...');
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'staff',
        identifier: 'STF-101',
        password: 'IncorrectPassword'
      })
    });
    assert(badLoginRes.status === 401, `Invalid credentials rejected with status 401`);

    // 18. Attempt to order non-existent café product -> MUST FAIL
    console.log('18. Testing order with non-existent product...');
    const badOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`
      },
      body: JSON.stringify({
        tableId: 'table-1',
        items: [{ menuItemId: 'non-existent-product', qty: 1 }]
      })
    });
    assert(badOrderRes.status === 404, `Invalid product order rejected with status 404`);

    console.log('\n================================================================');
    console.log(`🎉 ALL ${testPassedCount} END-TO-END WORKFLOW ASSERTIONS PASSED!`);
    console.log(`Failed Assertions: ${testFailedCount}`);
    console.log('================================================================\n');

  } catch (error) {
    console.error('\n💥 Test execution halted with error:', error.message);
    process.exit(1);
  }
}

runE2ETests();
