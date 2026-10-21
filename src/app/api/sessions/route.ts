import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { startSession } from "@/lib/services/sessionService";
import { authenticateRequest } from "@/lib/services/authService";

export async function GET() {
  const sessions = backendDataStore.sessions.map((s) => {
    const table = backendDataStore.tables.find((t) => t.id === s.table_id);
    const booking = backendDataStore.bookings.find((b) => b.id === s.booking_id);
    return {
      ...s,
      table,
      booking,
    };
  });

  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader) || {
    id: "STAFF-FLOOR",
    name: "Floor Concierge",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const { tableId, pin, bookingCode, isWalkIn } = body;

    if (!tableId && !pin && !bookingCode) {
      return NextResponse.json({ error: "tableId or pin is required" }, { status: 400 });
    }

    const result = startSession({
      tableId,
      pin,
      bookingCode,
      isWalkIn: Boolean(isWalkIn),
      actor: user,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error starting session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
