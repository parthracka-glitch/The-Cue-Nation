import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/services/authService";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || req.cookies.get("cn_token")?.value;
  const user = authenticateRequest(authHeader);

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
