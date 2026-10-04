import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/server/services/order.service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posContext = await OrderService.getPosContext();
    return NextResponse.json(posContext);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load POS data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const order = await OrderService.createOrder(body, session.user.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: `ORD-${order.id.slice(-6).toUpperCase()}`,
    });
  } catch (error: any) {
    console.error("POS order error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit order" },
      { status: 500 }
    );
  }
}
