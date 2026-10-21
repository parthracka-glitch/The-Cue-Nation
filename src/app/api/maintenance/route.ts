import { NextRequest, NextResponse } from "next/server";
import {
  getMaintenanceRecords,
  reportMaintenance,
  resolveMaintenance,
} from "@/lib/services/maintenanceService";
import { authenticateRequest } from "@/lib/services/authService";

export async function GET() {
  const records = getMaintenanceRecords();
  return NextResponse.json({ records });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader) || {
    id: "STAFF-FLOOR",
    name: "Staff Member",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const { tableId, issue, severity, markTableOffline } = body;

    if (!tableId || !issue) {
      return NextResponse.json({ error: "Table ID and issue description are required" }, { status: 400 });
    }

    const result = reportMaintenance({
      tableId,
      issue,
      severity: severity || "medium",
      actor: user,
      markTableOffline: Boolean(markTableOffline),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error reporting maintenance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader) || {
    id: "STAFF-FLOOR",
    name: "Staff Member",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const { recordId, notes, restoreTableToFree } = body;

    if (!recordId) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
    }

    const result = resolveMaintenance({
      recordId,
      notes: notes || "Issue addressed and table checked",
      restoreTableToFree: restoreTableToFree !== false,
      actor: user,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error resolving maintenance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
