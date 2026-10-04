import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BillingService } from "@/server/services/billing.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    const bills = await BillingService.getBillsList(statusFilter);
    return NextResponse.json({ bills });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load bills" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required for refunds" }, { status: 403 });
    }

    const { billId, reason } = await req.json();
    const updated = await BillingService.refundOrReopenBill(
      billId,
      reason || "Admin requested refund/void",
      session.user.id
    );

    return NextResponse.json({ success: true, bill: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Bill action failed" },
      { status: 400 }
    );
  }
}
