import { NextRequest, NextResponse } from "next/server";
import { endSession } from "@/lib/services/sessionService";
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
    const result = endSession(id, user);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error ending session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
