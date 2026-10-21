/**
 * QNation Professional WhatsApp Sharing Utility
 */

export interface WhatsAppBillDetails {
  customerName: string;
  customerPhone: string;
  billNumber: string;
  gameCategory: "Pool" | "Snooker" | string;
  tableName: string;
  dateStr: string;
  playingTimeRange: string;
  durationFormatted: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: "Paid" | "Payment Due" | "Partially Paid" | string;
  payMode?: string | null;
}

/**
 * Normalizes phone numbers to international E.164 format for WhatsApp click-to-chat
 * Example: "+91 98765-43210" -> "919876543210"
 * Example: "9876543210" -> "919876543210" (assumes India 91 if 10 digits)
 */
export function normalizeWhatsAppNumber(phone: string): {
  isValid: boolean;
  normalizedNumber: string;
  error?: string;
} {
  if (!phone) {
    return { isValid: false, normalizedNumber: "", error: "No contact number provided" };
  }

  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // If 10 digits (standard Indian mobile number without prefix), prepend 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    // 09876543210 -> 919876543210
    digits = `91${digits.slice(1)}`;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    // Already in 919876543210 format
  } else if (digits.length < 10) {
    return { isValid: false, normalizedNumber: digits, error: "Phone number is too short" };
  }

  return { isValid: true, normalizedNumber: digits };
}

/**
 * Generates the standardized professional WhatsApp message text
 */
export function generateWhatsAppMessage(details: WhatsAppBillDetails): string {
  const name = details.customerName?.trim() || "Valued Guest";
  const game = details.gameCategory || "Pool";
  const table = details.tableName || "Tournament Table";
  const status = details.paymentStatus || "Paid";

  const lines = [
    `Hello ${name},`,
    ``,
    `Thank you for visiting QNation!`,
    ``,
    `Here are your playing session bill details:`,
    ``,
    `Bill No: ${details.billNumber}`,
    `Game: ${game}`,
    `Table: ${table}`,
    `Date: ${details.dateStr}`,
    `Playing Time: ${details.playingTimeRange}`,
    `Duration: ${details.durationFormatted}`,
    `Total Amount: ₹${details.totalAmount.toFixed(2)}`,
    `Amount Paid: ₹${details.amountPaid.toFixed(2)}`,
    `Balance Due: ₹${details.balanceDue.toFixed(2)}`,
    `Payment Status: ${status}`,
    ``,
    `Your detailed bill is available as a PDF.`,
    ``,
    `Thank you for choosing QNation. We look forward to seeing you again!`,
  ];

  return lines.join("\n");
}

/**
 * Creates the full official WhatsApp Click-to-Chat URL
 */
export function getWhatsAppClickToChatUrl(
  phone: string,
  details: WhatsAppBillDetails
): {
  url: string;
  normalizedNumber: string;
  message: string;
  isValid: boolean;
  error?: string;
} {
  const { isValid, normalizedNumber, error } = normalizeWhatsAppNumber(phone);
  const message = generateWhatsAppMessage(details);

  if (!isValid) {
    return {
      url: "",
      normalizedNumber,
      message,
      isValid: false,
      error,
    };
  }

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${normalizedNumber}?text=${encodedMessage}`;

  return {
    url,
    normalizedNumber,
    message,
    isValid: true,
  };
}
