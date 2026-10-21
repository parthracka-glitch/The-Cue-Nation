import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { authenticateRequest } from "@/lib/services/authService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const actor = authenticateRequest(authHeader);

  // Bill retrieval is permitted for staff/admin or with a valid bill lookup
  const cleanId = decodeURIComponent(id).trim();

  const bill = backendDataStore.bills.find(
    (b) =>
      b.id === cleanId ||
      b.session_id === cleanId ||
      b.bill_number?.toUpperCase() === cleanId.toUpperCase()
  );

  if (!bill) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  // Populate session & table & booking
  const session = backendDataStore.sessions.find((s) => s.id === bill.session_id);
  const table = session ? backendDataStore.tables.find((t) => t.id === session.table_id) : undefined;
  const booking = session ? backendDataStore.bookings.find((b) => b.id === session.booking_id) : undefined;

  // Populate food orders
  const orders = backendDataStore.orders.filter((o) => o.session_id === bill.session_id);
  const foodOrders = orders.flatMap((o) =>
    (o.items || []).map((item) => ({
      name: item.menu_item?.name || "Kitchen Item",
      qty: item.qty,
      price: item.price,
      total: item.price * item.qty,
    }))
  );

  // Populate payment record if paid
  const paymentRecord = backendDataStore.payments.find((p) => p.booking_id === bill.session_id);

  return NextResponse.json({
    bill: {
      ...bill,
      session,
      table,
      booking,
      foodOrders,
      paymentRecord,
    },
  });
}
