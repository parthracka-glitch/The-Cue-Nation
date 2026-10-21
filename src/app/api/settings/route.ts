import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { authenticateRequest } from "@/lib/services/authService";
import { broadcastEvent } from "@/lib/services/realtimeEmitter";
import { logAuditEvent } from "@/lib/services/auditService";

export async function GET() {
  return NextResponse.json({ settings: backendDataStore.settings });
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader);

  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    Object.assign(backendDataStore.settings, body);

    broadcastEvent("SETTING_UPDATED", { settings: backendDataStore.settings });
    logAuditEvent({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "VENUE_SETTINGS_UPDATED",
      resourceType: "settings",
      resourceId: "global",
      details: body,
    });

    return NextResponse.json({ success: true, settings: backendDataStore.settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
