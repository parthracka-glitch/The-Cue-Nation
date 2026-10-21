import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { authenticateRequest } from "@/lib/services/authService";
import { broadcastEvent } from "@/lib/services/realtimeEmitter";
import { logAuditEvent } from "@/lib/services/auditService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const table = backendDataStore.tables.find((t) => t.id === id);
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const runningSession = backendDataStore.sessions.find(
    (s) => s.table_id === table.id && !s.ended_at
  );

  return NextResponse.json({ table, runningSession });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader) || {
    id: "STAFF",
    name: "Staff Floor",
    role: "staff" as const,
    email: "",
  };

  const table = backendDataStore.tables.find((t) => t.id === id);
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { status, active, name } = body;

    if (status !== undefined) {
      table.status = status;
      broadcastEvent("TABLE_STATUS_CHANGED", { tableId: table.id, status });
    }
    if (active !== undefined) {
      table.active = active;
    }
    if (name !== undefined) {
      table.name = name;
    }

    logAuditEvent({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "TABLE_UPDATED",
      resourceType: "table",
      resourceId: table.id,
      details: { status, active, name },
    });

    return NextResponse.json({ success: true, table });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating table";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
