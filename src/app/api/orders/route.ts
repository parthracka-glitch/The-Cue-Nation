import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { Order, OrderItem, OrderStatus } from "@/types/database";
import { broadcastEvent } from "@/lib/services/realtimeEmitter";
import { logAuditEvent } from "@/lib/services/auditService";
import { authenticateRequest } from "@/lib/services/authService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const tableId = searchParams.get("tableId");
  const status = searchParams.get("status");

  let list = [...backendDataStore.orders];

  if (sessionId) {
    list = list.filter((o) => o.session_id === sessionId);
  }
  if (tableId) {
    list = list.filter((o) => o.table_id === tableId);
  }
  if (status) {
    list = list.filter((o) => o.status === status);
  }

  // Populate items & tables
  const populated = list.map((order) => {
    const table = backendDataStore.tables.find((t) => t.id === order.table_id);
    const items = (order.items || []).map((it) => {
      const menuItem = backendDataStore.menu.find((m) => m.id === it.menu_item_id);
      return { ...it, menu_item: menuItem };
    });
    return {
      ...order,
      table,
      items,
    };
  });

  return NextResponse.json({ orders: populated });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const actor = authenticateRequest(authHeader) || {
    id: "STAFF-FLOOR",
    name: "Floor Attendant",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const { sessionId, tableId, items, clientRequestId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    // Determine target session or table
    let targetSessionId = sessionId || "";
    let targetTableId = tableId || "";

    if (!targetSessionId && targetTableId) {
      const activeSess = backendDataStore.sessions.find(
        (s) => s.table_id === targetTableId && !s.ended_at
      );
      if (activeSess) {
        targetSessionId = activeSess.id;
      }
    }

    if (!targetTableId && targetSessionId) {
      const sess = backendDataStore.sessions.find((s) => s.id === targetSessionId);
      if (sess) {
        targetTableId = sess.table_id;
      }
    }

    // Server-side authoritative price resolution & validation
    const orderId = clientRequestId || `order-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Check idempotency: if order with this clientRequestId already exists, return it
    const existing = backendDataStore.orders.find((o) => o.id === orderId);
    if (existing) {
      return NextResponse.json({ order: existing, alreadyExisted: true }, { status: 200 });
    }

    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const reqItem of items) {
      const menuItem = backendDataStore.menu.find((m) => m.id === reqItem.menuItemId);
      if (!menuItem) {
        return NextResponse.json({ error: `Product not found: ${reqItem.menuItemId}` }, { status: 404 });
      }
      if (!menuItem.available) {
        return NextResponse.json({ error: `Product is currently out of stock: ${menuItem.name}` }, { status: 400 });
      }

      const qty = Math.max(1, Number(reqItem.qty) || 1);
      const itemPrice = menuItem.price;
      subtotal += itemPrice * qty;

      orderItems.push({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        order_id: orderId,
        menu_item_id: menuItem.id,
        qty,
        price: itemPrice,
        menu_item: menuItem,
      });
    }

    const newOrder: Order = {
      id: orderId,
      session_id: targetSessionId,
      table_id: targetTableId || "walk-in-cafe",
      status: "new" as OrderStatus,
      created_at: new Date().toISOString(),
      items: orderItems,
    };

    backendDataStore.orders.unshift(newOrder);

    broadcastEvent("ORDER_CREATED", { order: newOrder, subtotal });
    logAuditEvent({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: "CAFE_ORDER_CREATED",
      resourceType: "order",
      resourceId: orderId,
      details: {
        tableId: targetTableId,
        sessionId: targetSessionId,
        subtotal,
        itemCount: orderItems.length,
      },
    });

    return NextResponse.json({ success: true, order: newOrder, subtotal }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating café order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const actor = authenticateRequest(authHeader) || {
    id: "STAFF-FLOOR",
    name: "Floor Staff",
    role: "staff" as const,
    email: "",
  };

  try {
    const body = await req.json();
    const id = searchParams.get("orderId") || body.orderId || body.id;
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
