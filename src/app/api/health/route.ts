import { NextRequest, NextResponse } from "next/server";
import { formatDateTimeIST, VENUE_TIMEZONE } from "@/lib/time";
import { backendDataStore } from "@/lib/services/dataStore";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    venue: "Cue Nation Parlour & Lounge",
    timezone: VENUE_TIMEZONE,
    serverTimeIST: formatDateTimeIST(new Date()),
    timestamp: Date.now(),
    liveFloor: "active",
  });
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    // Clean up test sessions & test bookings on main-pool for test isolation
    backendDataStore.bookings = backendDataStore.bookings.filter(
      (b) => !b.guest_name?.includes("Ananya Deshmukh") && !b.guest_name?.includes("Parth")
    );
    backendDataStore.sessions = backendDataStore.sessions.filter(
      (s) => s.table_id !== "main-pool" || s.ended_at !== null
    );
    const mainPoolTable = backendDataStore.tables.find((t) => t.id === "main-pool");
    if (mainPoolTable) mainPoolTable.status = "free";
    const mainPool = backendDataStore.pools.find((p) => p.id === "main-pool");
    if (mainPool) mainPool.status = "free";

    return NextResponse.json({ success: true, message: "Test environment reset" });
  }
  return NextResponse.json({ error: "Forbidden in production" }, { status: 403 });
}
