import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { createBooking, checkTableAvailability } from "@/lib/services/bookingService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tableId = searchParams.get("tableId");
  const status = searchParams.get("status");
  const phone = searchParams.get("phone");
  const checkConflict = searchParams.get("checkConflict");
  const startISO = searchParams.get("startISO");
  const endISO = searchParams.get("endISO");

  // Availability check query
  if (checkConflict === "true" && tableId && startISO && endISO) {
    const result = checkTableAvailability(tableId, startISO, endISO);
    return NextResponse.json(result);
  }

  let list = [...backendDataStore.bookings];

  if (tableId) {
    list = list.filter((b) => b.table_id === tableId);
  }
  if (status) {
    list = list.filter((b) => b.status === status);
  }
  if (phone) {
    list = list.filter((b) => b.guest_phone?.includes(phone));
  }

  return NextResponse.json({ bookings: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableId, startISO, endISO, guestName, guestPhone, guestEmail, userId, source, paymentMethod } = body;

    if (!tableId || !startISO || !endISO || !guestName || !guestPhone) {
      return NextResponse.json(
        { error: "Table, start time, end time, name, and phone are required" },
        { status: 400 }
      );
    }

    const result = createBooking({
      tableId,
      startISO,
      endISO,
      guestName,
      guestPhone,
      guestEmail,
      userId,
      source: source || "online",
      paymentMethod,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
