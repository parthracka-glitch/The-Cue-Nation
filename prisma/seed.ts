import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CueClub database seeding...");

  // 1. Clean existing records in correct relation order
  await prisma.dayClose.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.sessionPause.deleteMany();
  await prisma.session.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.gameTable.deleteMany();
  await prisma.rateBand.deleteMany();
  await prisma.rateCard.deleteMany();
  await prisma.packageDeal.deleteMany();
  await prisma.customerMembership.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();

  // 2. Users (Admin, Staff, Kitchen, Customer)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("Admin@123", salt);
  const staffPassword = await bcrypt.hash("Staff@123", salt);
  const kitchenPassword = await bcrypt.hash("Kitchen@123", salt);
  const playerPassword = await bcrypt.hash("Player@123", salt);

  const adminUser = await prisma.user.create({
    data: {
      name: "Vikram Malhotra",
      email: "admin@cueclub.demo",
      passwordHash: adminPassword,
      phone: "+919820011223",
      role: "ADMIN",
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      name: "Rohan Varma",
      email: "staff@cueclub.demo",
      passwordHash: staffPassword,
      phone: "+919820022334",
      role: "STAFF",
    },
  });

  await prisma.user.create({
    data: {
      name: "Chef Anand",
      email: "kitchen@cueclub.demo",
      passwordHash: kitchenPassword,
      phone: "+919820033445",
      role: "KITCHEN",
    },
  });

  const playerUser = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "player@cueclub.demo",
      passwordHash: playerPassword,
      phone: "+919876543210",
      role: "CUSTOMER",
    },
  });

  console.log("✅ Seeded 4 primary demo users");

  // 3. Settings
  const settingsData = [
    { key: "venue_name", value: JSON.stringify("CueClub") },
    { key: "opening_time", value: JSON.stringify("11:00") },
    { key: "closing_time", value: JSON.stringify("24:00") },
    { key: "slot_length_min", value: JSON.stringify(60) },
    { key: "deposit_percent", value: JSON.stringify(20) },
    { key: "gst_percent", value: JSON.stringify(5.0) },
    { key: "wallet_bonus_rule", value: JSON.stringify({ thresholdPaise: 100000, bonusPaise: 10000 }) }, // Rs 1000 get Rs 100
    { key: "loyalty_rule", value: JSON.stringify({ spendPerPointPaise: 10000, discountPerPointPaise: 100 }) }, // 1 pt per Rs 100, Rs 1 per pt
  ];

  for (const s of settingsData) {
    await prisma.setting.create({ data: s });
  }

  // 4. Rate Cards and Rate Bands
  // Pool Standard Rate Card
  const poolRateCard = await prisma.rateCard.create({
    data: {
      name: "Pool Standard",
      billingMode: "TIME",
      graceMinutes: 5,
      minChargeMinutes: 15,
      overtimeMultiplier: 1.25,
      bands: {
        create: [
          // Mon-Thu Day (11:00 - 17:00) = Rs 150/hr
          {
            daysOfWeek: "1,2,3,4",
            startMinute: 660,
            endMinute: 1020,
            ratePerHourPaise: 15000,
            label: "Day Rate",
          },
          // Mon-Thu Happy Hour (17:00 - 20:00) = Rs 100/hr
          {
            daysOfWeek: "1,2,3,4",
            startMinute: 1020,
            endMinute: 1200,
            ratePerHourPaise: 10000,
            label: "Happy Hour",
          },
          // Mon-Thu Evening (20:00 - 24:00) = Rs 250/hr
          {
            daysOfWeek: "1,2,3,4",
            startMinute: 1200,
            endMinute: 1440,
            ratePerHourPaise: 25000,
            label: "Evening Peak",
          },
          // Fri-Sun Weekend Peak (11:00 - 24:00) = Rs 300/hr
          {
            daysOfWeek: "5,6,7",
            startMinute: 660,
            endMinute: 1440,
            ratePerHourPaise: 30000,
            label: "Weekend Peak",
          },
        ],
      },
    },
    include: { bands: true },
  });

  // Snooker Standard Rate Card (Supports both Frame and Time)
  const snookerRateCard = await prisma.rateCard.create({
    data: {
      name: "Snooker Standard",
      billingMode: "TIME",
      framePricePaise: 12000, // Rs 120 per frame
      graceMinutes: 5,
      minChargeMinutes: 15,
      overtimeMultiplier: 1.3,
      bands: {
        create: [
          // Weekdays (Mon-Thu) = Rs 350/hr
          {
            daysOfWeek: "1,2,3,4",
            startMinute: 660,
            endMinute: 1440,
            ratePerHourPaise: 35000,
            label: "Snooker Weekday",
          },
          // Weekends (Fri-Sun) = Rs 450/hr
          {
            daysOfWeek: "5,6,7",
            startMinute: 660,
            endMinute: 1440,
            ratePerHourPaise: 45000,
            label: "Snooker Weekend",
          },
        ],
      },
    },
    include: { bands: true },
  });

  console.log("✅ Seeded Rate Cards and Rate Bands");

  // 5. Game Tables (8 tables: Pool 1-5, Snooker 1-2, Carom 1)
  const tablesData = [
    { name: "Pool Table 1", type: "POOL", rateCardId: poolRateCard.id, sortOrder: 1 },
    { name: "Pool Table 2", type: "POOL", rateCardId: poolRateCard.id, sortOrder: 2 },
    { name: "Pool Table 3", type: "POOL", rateCardId: poolRateCard.id, sortOrder: 3 },
    { name: "Pool Table 4", type: "POOL", rateCardId: poolRateCard.id, sortOrder: 4 },
    { name: "Pool Table 5", type: "POOL", rateCardId: poolRateCard.id, sortOrder: 5 },
    { name: "Snooker Table 1", type: "SNOOKER", rateCardId: snookerRateCard.id, sortOrder: 6 },
    { name: "Snooker Table 2", type: "SNOOKER", rateCardId: snookerRateCard.id, sortOrder: 7 },
    { name: "Carom Board 1", type: "CAROM", rateCardId: poolRateCard.id, sortOrder: 8 },
  ];

  const gameTables = [];
  for (const t of tablesData) {
    const table = await prisma.gameTable.create({ data: t });
    gameTables.push(table);
  }
  console.log(`✅ Seeded ${gameTables.length} Game Tables`);

  // 6. Packages
  await prisma.packageDeal.createMany({
    data: [
      {
        name: "5 Hour Pool Pack",
        billingMode: "TIME",
        quantity: 5,
        pricePaise: 100000, // Rs 1000
        tableType: "POOL",
        active: true,
      },
      {
        name: "10 Frame Snooker Pack",
        billingMode: "FRAME",
        quantity: 10,
        pricePaise: 100000, // Rs 1000
        tableType: "SNOOKER",
        active: true,
      },
    ],
  });

  // 7. Membership Plans
  const silverPlan = await prisma.membershipPlan.create({
    data: {
      name: "Silver Tier",
      priceInPaise: 99900, // Rs 999
      durationDays: 30,
      discountPercent: 10.0,
      includedMinutes: 0,
      active: true,
    },
  });

  const goldPlan = await prisma.membershipPlan.create({
    data: {
      name: "Gold VIP",
      priceInPaise: 249900, // Rs 2499
      durationDays: 30,
      discountPercent: 20.0,
      includedMinutes: 300, // 5 hours included
      active: true,
    },
  });

  // 8. Customers (15 realistic Indian customers)
  const customersData = [
    {
      name: "Rahul Sharma",
      phone: "+919876543210",
      email: "player@cueclub.demo",
      userId: playerUser.id,
      walletBalance: 150000, // Rs 1500
      creditBalance: 0,
      creditLimit: 500000,
      loyaltyPoints: 120,
      membership: { planId: goldPlan.id, startsDaysAgo: 5, endsDaysAhead: 25, minutesUsed: 60 },
    },
    {
      name: "Aman Gupta",
      phone: "+919811223344",
      email: "aman.gupta@example.in",
      walletBalance: 50000, // Rs 500
      creditBalance: 125000, // Rs 1250 owed (khata)
      creditLimit: 300000,
      loyaltyPoints: 85,
    },
    {
      name: "Pooja Patel",
      phone: "+919822334455",
      email: "pooja.p@example.in",
      walletBalance: 200000, // Rs 2000
      creditBalance: 0,
      creditLimit: 500000,
      loyaltyPoints: 210,
      membership: { planId: silverPlan.id, startsDaysAgo: 10, endsDaysAhead: 20, minutesUsed: 0 },
    },
    {
      name: "Kabir Mehta",
      phone: "+919833445566",
      email: "kabir.m@example.in",
      walletBalance: 0,
      creditBalance: 420000, // Rs 4200 owed (High credit / credit risk)
      creditLimit: 500000,
      loyaltyPoints: 40,
    },
    {
      name: "Rohan Deshmukh",
      phone: "+919844556677",
      email: "rohan.d@example.in",
      walletBalance: 30000,
      creditBalance: 85000, // Rs 850 owed
      creditLimit: 200000,
      loyaltyPoints: 60,
    },
    {
      name: "Ananya Iyer",
      phone: "+919855667788",
      email: "ananya.i@example.in",
      walletBalance: 120000,
      creditBalance: 0,
      creditLimit: 300000,
      loyaltyPoints: 140,
    },
    {
      name: "Devendra Singh",
      phone: "+919866778899",
      email: "devendra.s@example.in",
      walletBalance: 0,
      creditBalance: 0,
      creditLimit: 200000,
      loyaltyPoints: 15,
    },
    {
      name: "Sneha Reddy",
      phone: "+919877889900",
      email: "sneha.r@example.in",
      walletBalance: 80000,
      creditBalance: 0,
      creditLimit: 400000,
      loyaltyPoints: 95,
    },
    {
      name: "Aditya Roy",
      phone: "+919888990011",
      email: "aditya.roy@example.in",
      walletBalance: 0,
      creditBalance: 0,
      creditLimit: 250000,
      loyaltyPoints: 30,
    },
    {
      name: "Zoya Khan",
      phone: "+919899001122",
      email: "zoya.k@example.in",
      walletBalance: 45000,
      creditBalance: 0,
      creditLimit: 300000,
      loyaltyPoints: 50,
    },
    {
      name: "Karan Johar",
      phone: "+919810112233",
      email: "karan.j@example.in",
      walletBalance: 0,
      creditBalance: 0,
      creditLimit: 200000,
      loyaltyPoints: 0,
    },
    {
      name: "Meera Nair",
      phone: "+919821223344",
      email: "meera.n@example.in",
      walletBalance: 60000,
      creditBalance: 0,
      creditLimit: 200000,
      loyaltyPoints: 70,
    },
    {
      name: "Siddharth Verma",
      phone: "+919832334455",
      email: "sid.v@example.in",
      walletBalance: 0,
      creditBalance: 0,
      creditLimit: 200000,
      loyaltyPoints: 20,
    },
    {
      name: "Tanvi Kapoor",
      phone: "+919843445566",
      email: "tanvi.k@example.in",
      walletBalance: 15000,
      creditBalance: 0,
      creditLimit: 150000,
      loyaltyPoints: 10,
    },
    {
      name: "Varun Chopra",
      phone: "+919854556677",
      email: "varun.c@example.in",
      walletBalance: 0,
      creditBalance: 0,
      creditLimit: 200000,
      loyaltyPoints: 5,
    },
  ];

  const seededCustomers = [];
  const now = new Date();

  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        name: c.name,
        phone: c.phone,
        email: c.email,
        userId: c.userId,
        walletBalance: c.walletBalance,
        creditBalance: c.creditBalance,
        creditLimit: c.creditLimit,
        loyaltyPoints: c.loyaltyPoints,
        notes: c.creditBalance > 0 ? "Regular customer with active khata credit facility." : "Registered guest.",
      },
    });
    seededCustomers.push(customer);

    if (c.membership) {
      const startsAt = new Date(now.getTime() - c.membership.startsDaysAgo * 86400000);
      const endsAt = new Date(now.getTime() + c.membership.endsDaysAhead * 86400000);
      await prisma.customerMembership.create({
        data: {
          customerId: customer.id,
          planId: c.membership.planId,
          startsAt,
          endsAt,
          minutesUsed: c.membership.minutesUsed,
        },
      });
    }

    // Seed existing ledger entries for those with credit/wallet
    if (c.creditBalance > 0) {
      await prisma.ledgerEntry.create({
        data: {
          customerId: customer.id,
          type: "CREDIT_GIVEN",
          amountPaise: c.creditBalance,
          note: "Unsettled bill from previous game night session",
        },
      });
    }
    if (c.walletBalance > 0) {
      await prisma.ledgerEntry.create({
        data: {
          customerId: customer.id,
          type: "WALLET_TOPUP",
          amountPaise: c.walletBalance,
          note: "Promotional balance top-up via UPI",
        },
      });
    }
  }
  console.log(`✅ Seeded ${seededCustomers.length} Customers and Ledger Entries`);

  // 9. Menu Categories & 25 Items
  const menuConfig = [
    {
      category: "Coffee & Tea",
      station: "BAR",
      items: [
        { name: "Espresso Shot", pricePaise: 9000, emoji: "☕" },
        { name: "Cappuccino", pricePaise: 14000, emoji: "☕" },
        { name: "Cafe Latte", pricePaise: 16000, emoji: "🥛" },
        { name: "Iced Caramel Macchiato", pricePaise: 19000, emoji: "🧊" },
        { name: "Masala Chai", pricePaise: 8000, emoji: "🫖" },
      ],
    },
    {
      category: "Cold Drinks",
      station: "BAR",
      items: [
        { name: "Fresh Lime Soda", pricePaise: 9000, emoji: "🍋" },
        { name: "Peach Iced Tea", pricePaise: 13000, emoji: "🍹" },
        { name: "Red Bull Energy", pricePaise: 17500, emoji: "⚡" },
        { name: "Virgin Mojito", pricePaise: 15000, emoji: "🍸" },
        { name: "Cold Brew Tonic", pricePaise: 18000, emoji: "🥤" },
      ],
    },
    {
      category: "Snacks",
      station: "KITCHEN",
      items: [
        { name: "Crispy French Fries", pricePaise: 13000, emoji: "🍟" },
        { name: "Peri Peri Fries", pricePaise: 15000, emoji: "🍟" },
        { name: "Cheesy Garlic Bread", pricePaise: 18000, emoji: "🥖" },
        { name: "Loaded Nachos", pricePaise: 22000, emoji: "🧀" },
        { name: "Paneer Tikka Roll", pricePaise: 21000, emoji: "🌯" },
      ],
    },
    {
      category: "Meals",
      station: "KITCHEN",
      items: [
        { name: "CueClub Classic Veg Burger", pricePaise: 22000, emoji: "🍔" },
        { name: "Grilled Chicken Burger", pricePaise: 26000, emoji: "🍔" },
        { name: "Margherita Pizza (10\")", pricePaise: 32000, emoji: "🍕" },
        { name: "Spicy Pepperoni Pizza (10\")", pricePaise: 38000, emoji: "🍕" },
        { name: "Alfredo White Sauce Pasta", pricePaise: 28000, emoji: "🍝" },
      ],
    },
    {
      category: "Bar Bites",
      station: "KITCHEN",
      items: [
        { name: "Crispy Corn Kernels", pricePaise: 16000, emoji: "🌽" },
        { name: "Chilli Chicken Dry", pricePaise: 27000, emoji: "🍗" },
        { name: "BBQ Chicken Wings (6 pcs)", pricePaise: 29000, emoji: "🍗" },
        { name: "Veg Spring Rolls", pricePaise: 19000, emoji: "🥢" },
        { name: "Salted Roasted Peanuts", pricePaise: 9000, emoji: "🥜" },
      ],
    },
  ];

  let totalMenuItems = 0;
  const createdMenuItems: Record<string, string> = {};

  for (let i = 0; i < menuConfig.length; i++) {
    const cat = menuConfig[i];
    const category = await prisma.menuCategory.create({
      data: {
        name: cat.category,
        station: cat.station,
        sortOrder: i + 1,
      },
    });

    for (const item of cat.items) {
      const createdItem = await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          name: item.name,
          pricePaise: item.pricePaise,
          taxPercent: 5.0,
          imageEmoji: item.emoji,
          available: true,
        },
      });
      createdMenuItems[item.name] = createdItem.id;
      totalMenuItems++;
    }
  }
  console.log(`✅ Seeded ${menuConfig.length} Categories and ${totalMenuItems} Menu Items`);

  // 10. Historical Completed Sessions (12 past sessions over last 7 days with bills and payments)
  const poolSnapshot = JSON.stringify(poolRateCard);
  const snookerSnapshot = JSON.stringify(snookerRateCard);

  for (let i = 1; i <= 12; i++) {
    const daysAgo = Math.floor(i / 2);
    const sessionStart = new Date(now.getTime() - daysAgo * 86400000 - (i % 5) * 3600000);
    const durationMinutes = 45 + (i * 15) % 120;
    const sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60000);
    const tableIndex = (i - 1) % gameTables.length;
    const assignedTable = gameTables[tableIndex];
    const customer = seededCustomers[(i + 2) % seededCustomers.length];

    const historicalSession = await prisma.session.create({
      data: {
        tableId: assignedTable.id,
        customerId: customer.id,
        status: "ENDED",
        billingMode: "TIME",
        startedAt: sessionStart,
        endedAt: sessionEnd,
        rateCardSnapshot: assignedTable.type === "SNOOKER" ? snookerSnapshot : poolSnapshot,
      },
    });

    const tableCharge = Math.round((durationMinutes * 25000) / 60);
    const cafeItemCost = i % 2 === 0 ? 32000 : 15000;
    const subtotal = tableCharge + cafeItemCost;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    const bill = await prisma.bill.create({
      data: {
        sessionId: historicalSession.id,
        customerId: customer.id,
        subtotalPaise: subtotal,
        taxPaise: tax,
        discountPaise: 0,
        totalPaise: total,
        status: "PAID",
        splitMode: i % 3 === 0 ? "EVEN" : "NONE",
        createdAt: sessionEnd,
        closedAt: sessionEnd,
      },
    });

    await prisma.payment.create({
      data: {
        billId: bill.id,
        customerId: customer.id,
        method: i % 2 === 0 ? "UPI" : "CASH",
        amountPaise: total,
        reference: `PAY-HIST-${i}-REF`,
        label: "Full Settlement",
        createdAt: sessionEnd,
      },
    });
  }
  console.log("✅ Seeded 12 Historical Completed Sessions, Bills and Payments");

  // 11. Upcoming and Current Reservations (6 reservations)
  const reservationStatuses = ["CONFIRMED", "CONFIRMED", "PENDING", "CONFIRMED", "PENDING", "COMPLETED"];
  for (let i = 0; i < 6; i++) {
    const isToday = i < 3;
    const resDate = new Date(now.getTime() + (isToday ? 2 + i : 24 + i) * 3600000);
    const resEndDate = new Date(resDate.getTime() + 7200000); // 2 hours
    const customer = seededCustomers[i];

    await prisma.reservation.create({
      data: {
        code: `CQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        customerId: customer.id,
        guestName: customer.name,
        guestPhone: customer.phone,
        tableId: gameTables[i % 5].id,
        tableType: "POOL",
        startsAt: resDate,
        endsAt: resEndDate,
        partySize: 2 + (i % 3),
        status: reservationStatuses[i],
        depositPaise: 30000, // Rs 300 deposit
        depositPaid: true,
        notes: isToday ? "Arriving around 8 PM" : "Weekend tournament practice",
      },
    });
  }
  console.log("✅ Seeded 6 Reservations");

  // 12. Active RUNNING Sessions (Pool 2 and Snooker 1)
  const pool2 = gameTables.find((t) => t.name === "Pool Table 2") || gameTables[1];
  const snooker1 = gameTables.find((t) => t.name === "Snooker Table 1") || gameTables[5];

  // Set table status to OCCUPIED
  await prisma.gameTable.update({
    where: { id: pool2.id },
    data: { status: "OCCUPIED" },
  });
  await prisma.gameTable.update({
    where: { id: snooker1.id },
    data: { status: "OCCUPIED" },
  });

  // Pool 2 active session started 35 minutes ago
  const pool2Session = await prisma.session.create({
    data: {
      tableId: pool2.id,
      customerId: seededCustomers[0].id, // Rahul Sharma
      status: "RUNNING",
      billingMode: "TIME",
      startedAt: new Date(now.getTime() - 35 * 60000),
      rateCardSnapshot: poolSnapshot,
    },
  });

  // Order for Pool 2 with items
  const pool2Order = await prisma.order.create({
    data: {
      sessionId: pool2Session.id,
      tableId: pool2.id,
      customerId: seededCustomers[0].id,
      type: "DINE_IN_TABLE",
      status: "SENT",
      createdById: staffUser.id,
    },
  });

  const friesId = createdMenuItems["Crispy French Fries"] || Object.values(createdMenuItems)[0];
  const cokeId = createdMenuItems["Fresh Lime Soda"] || Object.values(createdMenuItems)[1];

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: pool2Order.id,
        menuItemId: friesId,
        nameSnapshot: "Crispy French Fries",
        unitPricePaise: 13000,
        quantity: 1,
        kotStatus: "PREPARING",
        assignedToCustomerId: seededCustomers[0].id,
      },
      {
        orderId: pool2Order.id,
        menuItemId: cokeId,
        nameSnapshot: "Fresh Lime Soda",
        unitPricePaise: 9000,
        quantity: 2,
        kotStatus: "READY",
        assignedToCustomerId: seededCustomers[0].id,
      },
    ],
  });

  // Snooker 1 active session started 50 minutes ago
  await prisma.session.create({
    data: {
      tableId: snooker1.id,
      customerId: seededCustomers[1].id, // Aman Gupta
      status: "RUNNING",
      billingMode: "TIME",
      startedAt: new Date(now.getTime() - 50 * 60000),
      rateCardSnapshot: snookerSnapshot,
    },
  });

  console.log("✅ Seeded 2 Active RUNNING Sessions on Pool 2 and Snooker 1 with active F&B orders");
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
