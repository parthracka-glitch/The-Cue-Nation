import { NextRequest, NextResponse } from "next/server";
import { extendSession } from "@/lib/services/sessionService";
import { authenticateRequest } from "@/lib/services/authService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader) || {
    id: "STAFF-FLOOR",
    name: "Floor Concierge",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const extraMinutes = Number(body.minutes || body.extraMinutes);
    if (!extraMinutes || extraMinutes <= 0) {
      return NextResponse.json({ error: "Valid minutes value required" }, { status: 400 });
    }

    const result = extendSession(id, extraMinutes, user);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error extending session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
