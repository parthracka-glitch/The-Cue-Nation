import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BillingService } from "@/server/services/billing.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = params;
    const folio = await BillingService.getCheckoutFolio(sessionId);
    return NextResponse.json(folio);
  } catch (error: any) {
    console.error("Folio fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate session folio" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = params;
    const body = await req.json();

    const settlementResult = await BillingService.settleSession(
      sessionId,
      body,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      ...settlementResult,
    });
  } catch (error: any) {
    console.error("Settlement error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to settle bill" },
      { status: 400 }
    );
  }
}
