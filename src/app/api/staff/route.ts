import { NextRequest, NextResponse } from "next/server";
import { getStaffAccounts, createStaffAccount } from "@/lib/services/staffService";
import { authenticateRequest } from "@/lib/services/authService";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader);

  // Accessible by staff or admin
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = getStaffAccounts();
  return NextResponse.json({ staff });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader);

  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { staff_id, name, email, phone, role, initialPassword } = body;

    if (!staff_id || !name || !email || !initialPassword) {
      return NextResponse.json(
        { error: "Staff ID, name, email, and initial password are required" },
        { status: 400 }
      );
    }

    const result = createStaffAccount(user, {
      staff_id,
      name,
      email,
      phone: phone || "",
      role: role === "manager" ? "manager" : "staff",
      initialPassword,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating staff account";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
