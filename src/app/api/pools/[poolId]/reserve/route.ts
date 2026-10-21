import { NextRequest, NextResponse } from "next/server";
import { createTemporaryHold } from "@/lib/services/bookingService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    const body = await req.json();
    const { startISO, endISO, customerId } = body;

    if (!startISO || !endISO) {
      return NextResponse.json({ error: "startISO and endISO are required" }, { status: 400 });
    }

    const result = createTemporaryHold(poolId, startISO, endISO, customerId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, hold: result.hold }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create reservation hold";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
