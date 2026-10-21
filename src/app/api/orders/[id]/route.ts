import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { OrderStatus } from "@/types/database";
import { broadcastEvent } from "@/lib/services/realtimeEmitter";
import { logAuditEvent } from "@/lib/services/auditService";
import { authenticateRequest } from "@/lib/services/authService";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const actor = authenticateRequest(authHeader) || {
    id: "STAFF-FLOOR",
    name: "Floor Staff",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const { status } = body;

    const order = backendDataStore.orders.find((o) => o.id === id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const validStatuses: OrderStatus[] = ["new", "preparing", "ready", "served", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid order status transition" }, { status: 400 });
    }

    const previousStatus = order.status;
    order.status = status as OrderStatus;

    broadcastEvent("ORDER_STATUS_CHANGED", { orderId: id, status, previousStatus });
    logAuditEvent({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: "ORDER_STATUS_UPDATED",
      resourceType: "order",
      resourceId: id,
      details: { previousStatus, newStatus: status },
    });

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
