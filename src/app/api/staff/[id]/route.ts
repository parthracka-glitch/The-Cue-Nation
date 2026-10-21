import { NextRequest, NextResponse } from "next/server";
import { toggleStaffStatus, resetStaffPassword } from "@/lib/services/staffService";
import { authenticateRequest } from "@/lib/services/authService";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader);

  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, active, newPassword } = body;

    if (action === "toggle_active") {
      const result = toggleStaffStatus(user, id, Boolean(active));
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Staff status updated" });
    }

    if (action === "reset_password") {
      if (!newPassword) {
        return NextResponse.json({ error: "New password is required" }, { status: 400 });
      }
      const result = resetStaffPassword(user, id, newPassword);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Staff password reset" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating staff account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
