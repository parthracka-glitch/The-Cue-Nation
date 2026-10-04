import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/server/services/order.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "KITCHEN" && session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stationFilter = searchParams.get("station"); // KITCHEN | BAR | ALL

    const items = await OrderService.getKitchenTickets(stationFilter);
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load kitchen tickets" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderItemId, newStatus } = await req.json();
    const updated = await OrderService.updateTicketItemStatus(orderItemId, newStatus);

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to advance ticket status" },
      { status: 500 }
    );
  }
}
