import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { authenticateRequest } from "@/lib/services/authService";
import { broadcastEvent } from "@/lib/services/realtimeEmitter";
import { logAuditEvent } from "@/lib/services/auditService";
import { GameTable } from "@/types/database";

export async function GET() {
  const tablesWithDetails = backendDataStore.tables.map((table) => {
    const runningSession = backendDataStore.sessions.find(
      (s) => s.table_id === table.id && !s.ended_at
    );
    const activeBooking = runningSession
      ? backendDataStore.bookings.find((b) => b.id === runningSession.booking_id)
      : null;

    return {
      ...table,
      runningSession,
      activeBooking,
    };
  });

  return NextResponse.json({ tables: tablesWithDetails });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader);

  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, type, qr_secret } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const newTable: GameTable = {
      id: `table-${Date.now()}`,
      name: name.trim(),
      type: type === "snooker" ? "snooker" : "pool",
      status: "free",
      qr_secret: qr_secret || `secret-${Date.now()}`,
      active: true,
    };

    backendDataStore.tables.push(newTable);

    broadcastEvent("TABLE_STATUS_CHANGED", { tableId: newTable.id, status: "free" });
    logAuditEvent({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "TABLE_CREATED",
      resourceType: "table",
      resourceId: newTable.id,
      details: { name: newTable.name, type: newTable.type },
    });

    return NextResponse.json({ success: true, table: newTable }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating table";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
