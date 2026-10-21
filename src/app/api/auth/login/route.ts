import { NextRequest, NextResponse } from "next/server";
import { loginStaff, loginAdmin } from "@/lib/services/authService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, identifier, email, password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (type === "admin") {
      const targetEmail = email || identifier;
      if (!targetEmail) {
        return NextResponse.json({ error: "Admin email is required" }, { status: 400 });
      }
      const result = loginAdmin(targetEmail, password);
      if (!result.success || !result.token) {
        return NextResponse.json({ error: result.error || "Authentication failed" }, { status: 401 });
      }

      const response = NextResponse.json(result);
      response.cookies.set("cn_admin_token", result.token, {
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        maxAge: 86400 * 7,
      });
      response.cookies.set("cue_user_role", "owner", {
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        maxAge: 86400 * 7,
      });
      return response;
    } else {
      // Default to staff login
      const targetId = identifier || email;
      if (!targetId) {
        return NextResponse.json({ error: "Staff ID or Email is required" }, { status: 400 });
      }
      const result = loginStaff(targetId, password);
      if (!result.success || !result.token) {
        return NextResponse.json({ error: result.error || "Authentication failed" }, { status: 401 });
      }

      const response = NextResponse.json(result);
      response.cookies.set("cn_staff_token", result.token, {
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        maxAge: 86400 * 7,
      });
      response.cookies.set("cue_user_role", result.user?.role || "staff", {
        httpOnly: false,
        path: "/",
        sameSite: "lax",
        maxAge: 86400 * 7,
      });
      return response;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal authentication error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
