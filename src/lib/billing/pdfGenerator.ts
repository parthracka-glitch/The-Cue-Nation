import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface BillPdfData {
  billNumber: string;
  issueDate: string;
  customerName: string;
  customerPhone?: string;
  bookingCode?: string;
  gameCategory: "Pool" | "Snooker" | string;
  tableName: string;
  sessionStartTime: string;
  sessionEndTime: string;
  durationMinutes: number;
  hourlyRate: number;
  timeCharge: number;
  foodOrders?: Array<{
    name: string;
    qty: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount?: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: "Paid" | "Payment Due" | "Partially Paid" | string;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  staffName?: string;
}

export function generateBillPdf(data: BillPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // 1. BRAND HEADER (Dark Luxury Aesthetic)
  doc.setFillColor(15, 23, 42); // Midnight #0F172A
  doc.rect(0, 0, pageWidth, 38, "F");

  // Accent Line
  doc.setFillColor(197, 160, 89); // Bronze #C5A059
  doc.rect(0, 36, pageWidth, 2, "F");

  // Title & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("CUE NATION", margin, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(197, 160, 89);
  doc.text("CHAMPIONSHIP PARLOUR & LOUNGE · OWN THE TABLE", margin, 21);

  doc.setTextColor(200, 205, 215);
  doc.setFontSize(7.5);
  doc.text("80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034", margin, 27);
  doc.text("Concierge Desk: +91 80 4123 4567 | concierge@cuenation.club", margin, 32);

  // Bill Label & Number (Top Right)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("INVOICE / BILL", pageWidth - margin, 15, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(197, 160, 89);
  doc.text(data.billNumber, pageWidth - margin, 22, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 190, 205);
  doc.text(`Date: ${data.issueDate}`, pageWidth - margin, 28, { align: "right" });

  // 2. STATUS BADGE
  const isPaid = data.paymentStatus.toLowerCase().includes("paid") && data.balanceDue <= 0;
  const statusX = pageWidth - margin;
  const statusY = 44;

  if (isPaid) {
    doc.setFillColor(27, 77, 62); // Green #1B4D3E
    doc.rect(statusX - 32, statusY, 32, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("STATUS: PAID", statusX - 16, statusY + 4.8, { align: "center" });
  } else {
    doc.setFillColor(180, 83, 9); // Amber
    doc.rect(statusX - 44, statusY, 44, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("STATUS: PAYMENT DUE", statusX - 22, statusY + 4.8, { align: "center" });
  }

  // 3. TWO-COLUMN DETAILS SECTION
  let currentY = 56;

  // Box 1: Customer Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, 86, 36, 2, 2, "FD");

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("BILLED TO (CUSTOMER)", margin + 4, currentY + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(data.customerName || "Valued Guest", margin + 4, currentY + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${data.customerPhone || "N/A"}`, margin + 4, currentY + 20);
  doc.text(`Booking Ref: ${data.bookingCode || "N/A"}`, margin + 4, currentY + 26);
  if (data.staffName) {
    doc.text(`Served By: ${data.staffName}`, margin + 4, currentY + 32);
  }

  // Box 2: Game & Session Details
  const rightColX = margin + 92;
  const rightColW = pageWidth - margin - rightColX;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightColX, currentY, rightColW, 36, 2, 2, "FD");

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("GAME & SESSION DETAILS", rightColX + 4, currentY + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(`${data.gameCategory} · ${data.tableName}`, rightColX + 4, currentY + 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Playing Time: ${data.sessionStartTime} - ${data.sessionEndTime}`, rightColX + 4, currentY + 20);

  const hours = Math.floor(data.durationMinutes / 60);
  const mins = data.durationMinutes % 60;
  const durationText = hours > 0 ? `${hours} hr ${mins} min (${data.durationMinutes} mins)` : `${mins} mins`;
  doc.text(`Total Duration: ${durationText}`, rightColX + 4, currentY + 26);
  doc.text(`Hourly Rate: Rs. ${data.hourlyRate.toFixed(2)}/hour`, rightColX + 4, currentY + 32);

  currentY += 42;

  // 4. ITEMIZED CHARGES TABLE (via jspdf-autotable)
  const tableRows: Array<Array<string>> = [];

  // Line 1: Table Session Play
  tableRows.push([
    `${data.gameCategory} Playing Session — ${data.tableName}\nDuration: ${durationText}`,
    `Rs. ${data.hourlyRate.toFixed(2)}`,
    `${(data.durationMinutes / 60).toFixed(2)} hrs`,
    `Rs. ${data.timeCharge.toFixed(2)}`,
  ]);

  // Food / Café lines if present
  if (data.foodOrders && data.foodOrders.length > 0) {
    data.foodOrders.forEach((item) => {
      tableRows.push([
        `Café / Lounge: ${item.name}`,
        `Rs. ${item.price.toFixed(2)}`,
        `${item.qty}`,
        `Rs. ${item.total.toFixed(2)}`,
      ]);
    });
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Item Description", "Rate / Unit", "Qty / Duration", "Amount"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [30, 41, 59],
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: "right" },
      2: { halign: "center" },
      3: { halign: "right", fontStyle: "bold" },
    },
  });

  // 5. TOTALS & FINANCIAL SUMMARY
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const summaryX = pageWidth - margin - 75;

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  let sumY = finalY;
  doc.text("Table Playing Charges:", summaryX, sumY);
  doc.text(`Rs. ${data.timeCharge.toFixed(2)}`, pageWidth - margin, sumY, { align: "right" });

  if (data.foodOrders && data.foodOrders.length > 0) {
    const foodSubtotal = data.foodOrders.reduce((acc, curr) => acc + curr.total, 0);
    sumY += 6;
    doc.text("Café & Refreshments:", summaryX, sumY);
    doc.text(`Rs. ${foodSubtotal.toFixed(2)}`, pageWidth - margin, sumY, { align: "right" });
  }

  if (data.taxAmount && data.taxAmount > 0) {
    sumY += 6;
    doc.text("Taxes (GST 5%):", summaryX, sumY);
    doc.text(`Rs. ${data.taxAmount.toFixed(2)}`, pageWidth - margin, sumY, { align: "right" });
  }

  // Divider
  sumY += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX, sumY, pageWidth - margin, sumY);

  // Grand Total
  sumY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Grand Total:", summaryX, sumY);
  doc.setTextColor(197, 160, 89);
  doc.text(`Rs. ${data.total.toFixed(2)}`, pageWidth - margin, sumY, { align: "right" });

  // Amount Paid & Balance Due
  sumY += 6;
  doc.setFontSize(9);
  doc.setTextColor(27, 77, 62);
  doc.text("Amount Paid:", summaryX, sumY);
  doc.text(`Rs. ${data.amountPaid.toFixed(2)}`, pageWidth - margin, sumY, { align: "right" });

  sumY += 5;
  doc.setTextColor(data.balanceDue > 0 ? 180 : 100, 83, 9);
  doc.text("Balance Due:", summaryX, sumY);
  doc.text(`Rs. ${data.balanceDue.toFixed(2)}`, pageWidth - margin, sumY, { align: "right" });

  // Payment method note on bottom left
  let noteY = finalY;
  if (data.paymentMethod) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Payment Mode: ${data.paymentMethod.toUpperCase()}`, margin, noteY);
    if (data.paymentReference) {
      noteY += 5;
      doc.text(`Transaction Reference: ${data.paymentReference}`, margin, noteY);
    }
  }

  // 6. FOOTER & THANK YOU
  const footerY = doc.internal.pageSize.getHeight() - 18;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Thank you for playing at Cue Nation Parlour & Lounge!", pageWidth / 2, footerY, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Computer-generated invoice. For inquiries or table reservations, visit cuenation.club",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  return doc;
}

export function downloadBillPdf(data: BillPdfData, filename?: string) {
  const doc = generateBillPdf(data);
  const name = filename || `QNation_Bill_${data.billNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(name);
}
