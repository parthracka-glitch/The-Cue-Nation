import { describe, it, expect } from "vitest";
import {
  normalizeWhatsAppNumber,
  generateWhatsAppMessage,
  getWhatsAppClickToChatUrl,
  WhatsAppBillDetails,
} from "../whatsappHelper";
import { generateBillPdf, BillPdfData } from "../pdfGenerator";
import { endSession, startSession } from "../../services/sessionService";
import { backendDataStore } from "../../services/dataStore";

describe("WhatsApp Integration & Phone Normalization", () => {
  it("normalizes 10-digit Indian numbers by prepending 91", () => {
    const result = normalizeWhatsAppNumber("9876543210");
    expect(result.isValid).toBe(true);
    expect(result.normalizedNumber).toBe("919876543210");
  });

  it("handles numbers with spaces, dashes, and +91 prefix", () => {
    const result = normalizeWhatsAppNumber("+91 98450-11223");
    expect(result.isValid).toBe(true);
    expect(result.normalizedNumber).toBe("919845011223");
  });

  it("normalizes leading-zero 11-digit numbers", () => {
    const result = normalizeWhatsAppNumber("09876543210");
    expect(result.isValid).toBe(true);
    expect(result.normalizedNumber).toBe("919876543210");
  });

  it("flags empty or invalid phone numbers safely without crashing", () => {
    const emptyResult = normalizeWhatsAppNumber("");
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.error).toBeDefined();

    const shortResult = normalizeWhatsAppNumber("12345");
    expect(shortResult.isValid).toBe(false);
    expect(shortResult.error).toContain("too short");
  });

  it("formats standard WhatsApp message matching business specification", () => {
    const details: WhatsAppBillDetails = {
      customerName: "Rahul Sharma",
      customerPhone: "+91 98765 43210",
      billNumber: "QN-2026-00125",
      gameCategory: "Pool",
      tableName: "Pool Table 2",
      dateStr: "21 October 2026",
      playingTimeRange: "5:00 PM – 6:30 PM",
      durationFormatted: "1 hour 30 minutes",
      totalAmount: 450,
      amountPaid: 450,
      balanceDue: 0,
      paymentStatus: "Paid",
    };

    const message = generateWhatsAppMessage(details);
    expect(message).toContain("Hello Rahul Sharma,");
    expect(message).toContain("Bill No: QN-2026-00125");
    expect(message).toContain("Game: Pool");
    expect(message).toContain("Table: Pool Table 2");
    expect(message).toContain("Playing Time: 5:00 PM – 6:30 PM");
    expect(message).toContain("Duration: 1 hour 30 minutes");
    expect(message).toContain("Total Amount: ₹450.00");
    expect(message).toContain("Amount Paid: ₹450.00");
    expect(message).toContain("Balance Due: ₹0.00");
    expect(message).toContain("Payment Status: Paid");
    expect(message).toContain("Your detailed bill is available as a PDF.");
  });

  it("builds the official WhatsApp click-to-chat URL with encoded text", () => {
    const details: WhatsAppBillDetails = {
      customerName: "Aman Gupta",
      customerPhone: "9876543210",
      billNumber: "QN-2026-00001",
      gameCategory: "Snooker",
      tableName: "Snooker Table 1",
      dateStr: "21 October 2026",
      playingTimeRange: "2:00 PM – 3:00 PM",
      durationFormatted: "60 min",
      totalAmount: 500,
      amountPaid: 500,
      balanceDue: 0,
      paymentStatus: "Paid",
    };

    const res = getWhatsAppClickToChatUrl("9876543210", details);
    expect(res.isValid).toBe(true);
    expect(res.normalizedNumber).toBe("919876543210");
    expect(res.url).toContain("https://wa.me/919876543210?text=");
    expect(res.url).toContain(encodeURIComponent("QN-2026-00001"));
  });
});

describe("PDF Generation Architecture", () => {
  it("creates genuine vector PDF document without throwing errors", () => {
    const sampleData: BillPdfData = {
      billNumber: "QN-2026-00001",
      issueDate: "21/10/2026, 03:30:00 pm",
      customerName: "Vikram Malhotra",
      customerPhone: "+91 98450 11223",
      bookingCode: "CN-DEMO01",
      gameCategory: "Pool",
      tableName: "Pool Table 3",
      sessionStartTime: "03:00 pm",
      sessionEndTime: "04:30 pm",
      durationMinutes: 90,
      hourlyRate: 350,
      timeCharge: 525,
      foodOrders: [
        { name: "Cold Brew", qty: 2, price: 180, total: 360 },
      ],
      subtotal: 885,
      taxAmount: 44,
      total: 929,
      amountPaid: 929,
      balanceDue: 0,
      paymentStatus: "Paid",
      paymentMethod: "upi",
    };

    const doc = generateBillPdf(sampleData);
    expect(doc).toBeDefined();
    expect(Math.round(doc.internal.pageSize.getWidth())).toBe(210);
    expect(Math.round(doc.internal.pageSize.getHeight())).toBe(297);
  });
});

describe("Authoritative Backend Session Billing & Idempotency", () => {
  it("generates sequential bill number and allows idempotent retrieval", () => {
    const actor = { id: "STAFF-01", name: "Staff Member", role: "staff" };

    // 1. Start a session
    const startRes = startSession({
      tableId: "pool-1",
      isWalkIn: true,
      actor,
    });
    expect(startRes.success).toBe(true);
    const sessionId = startRes.session!.id;

    // 2. End the session -> creates bill
    const endRes1 = endSession(sessionId, actor);
    expect(endRes1.success).toBe(true);
    expect(endRes1.bill).toBeDefined();
    expect(endRes1.bill?.bill_number).toMatch(/^QN-\d{4}-\d{5}$/);
    const firstBillId = endRes1.bill!.id;
    const firstBillNumber = endRes1.bill!.bill_number;

    // 3. Repeat call on ended session -> must be idempotent and return identical bill
    const endRes2 = endSession(sessionId, actor);
    expect(endRes2.success).toBe(true);
    expect(endRes2.bill?.id).toBe(firstBillId);
    expect(endRes2.bill?.bill_number).toBe(firstBillNumber);
  });
});
