import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/services/auditService";
import { authenticateRequest } from "@/lib/services/authService";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader);

  // Require admin or owner role to inspect audit logs
  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || undefined;
  const actorRole = searchParams.get("actorRole") || undefined;
  const resourceType = searchParams.get("resourceType") || undefined;

  const logs = getAuditLogs({ action, actorRole, resourceType });
  return NextResponse.json({ logs });
}
