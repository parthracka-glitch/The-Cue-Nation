import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CustomerService } from "@/server/services/customer.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await CustomerService.getCustomerById(params.id);
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load customer profile" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, amountPaise, method = "UPI", note } = await req.json();

    if (action === "REPAYMENT") {
      const updatedCustomer = await CustomerService.recordKhataRepayment(
        params.id,
        amountPaise,
        method,
        note,
        session.user.id
      );
      return NextResponse.json({ success: true, customer: updatedCustomer });
    }

    if (action === "WALLET_TOPUP") {
      const result = await CustomerService.topUpWallet(
        params.id,
        amountPaise,
        method,
        session.user.id
      );
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "SEND_REMINDER") {
      await CustomerService.sendKhataReminder(params.id);
      return NextResponse.json({
        success: true,
        message: "Reminder dispatched via simulated WhatsApp!",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Ledger action failed" },
      { status: 500 }
    );
  }
}
