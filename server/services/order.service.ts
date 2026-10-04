import prisma from "@/lib/db";
import { logAudit } from "../utils/audit";

export interface CreateOrderItemInput {
  menuItemId: string;
  name: string;
  unitPricePaise: number;
  quantity: number;
  notes?: string;
  assignedToCustomerId?: string | null;
}

export interface CreateOrderInput {
  targetType?: string; // DINE_IN_TABLE | TAKEAWAY
  sessionId?: string;
  tableId?: string;
  customerId?: string;
  items: CreateOrderItemInput[];
}

export class OrderService {
  /**
   * Retrieves menu catalog organized by category for POS or public display.
   */
  static async getMenuCatalog() {
    return await prisma.menuCategory.findMany({
      include: {
        items: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Retrieves POS context including categories, items, and active tables/sessions.
   */
  static async getPosContext() {
    const categories = await prisma.menuCategory.findMany({
      include: {
        items: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const activeSessions = await prisma.session.findMany({
      where: { status: { in: ["RUNNING", "PAUSED"] } },
      include: {
        table: true,
        customer: true,
      },
      orderBy: { startedAt: "desc" },
    });

    return {
      categories,
      activeSessions: activeSessions.map((s) => ({
        id: s.id,
        tableId: s.tableId,
        tableName: s.table.name,
        customerName: s.customer?.name || "Walk-in Guest",
      })),
    };
  }

  /**
   * Submits a new POS order to kitchen/bar.
   */
  static async createOrder(input: CreateOrderInput, staffUserId?: string) {
    const { targetType = "DINE_IN_TABLE", sessionId, tableId, customerId, items } = input;

    if (!items || items.length === 0) {
      throw new Error("No items selected for order");
    }

    // Resolve valid createdById
    let creatorId = staffUserId;
    if (!creatorId) {
      const firstAdmin = await prisma.user.findFirst({ select: { id: true } });
      creatorId = firstAdmin?.id || "admin";
    }

    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          type: targetType,
          status: "OPEN",
          sessionId: sessionId || null,
          tableId: tableId || null,
          customerId: customerId || null,
          createdById: creatorId!,
        },
      });

      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            nameSnapshot: item.name,
            unitPricePaise: item.unitPricePaise,
            quantity: item.quantity,
            notes: item.notes || null,
            assignedToCustomerId: item.assignedToCustomerId || null,
            kotStatus: "NEW",
          },
        });
      }

      await logAudit(
        {
          userId: creatorId,
          action: "ORDER_CREATED",
          entity: "ORDER",
          entityId: order.id,
          meta: {
            orderId: order.id,
            itemCount: items.length,
          },
        },
        tx
      );

      return order;
    });
  }

  /**
   * Retrieves active tickets for the Kitchen Display System (KDS).
   */
  static async getKitchenTickets(stationFilter?: string | null) {
    const items = await prisma.orderItem.findMany({
      where: {
        kotStatus: { in: ["NEW", "PREPARING", "READY"] },
        menuItem:
          stationFilter && stationFilter !== "ALL"
            ? { category: { station: stationFilter } }
            : undefined,
      },
      include: {
        order: {
          include: {
            table: true,
            customer: true,
          },
        },
        menuItem: {
          include: { category: true },
        },
      },
      orderBy: { id: "asc" },
    });

    const now = Date.now();

    return items.map((item) => {
      const sentTime = new Date(item.order.createdAt).getTime();
      const elapsedMinutes = Math.floor((now - sentTime) / 60000);

      return {
        id: item.id,
        orderId: item.orderId,
        tableName:
          item.order.table?.name ||
          (item.order.type === "TAKEAWAY" ? "Takeaway" : "Bar Walk-in"),
        tableType: item.order.table?.type || "DINE",
        customerName: item.order.customer?.name || "Guest",
        itemName: item.nameSnapshot,
        emoji: item.menuItem.imageEmoji || "🍽️",
        quantity: item.quantity,
        notes: item.notes,
        station: item.menuItem.category.station,
        kotStatus: item.kotStatus as "NEW" | "PREPARING" | "READY" | "SERVED" | "CANCELLED",
        sentAt: item.order.createdAt.toISOString(),
        elapsedMinutes,
      };
    });
  }

  /**
   * Updates an item's preparation status in KDS (NEW -> PREPARING -> READY -> SERVED).
   */
  static async updateTicketItemStatus(orderItemId: string, newStatus: string) {
    const validStatuses = ["NEW", "PREPARING", "READY", "SERVED", "CANCELLED"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { kotStatus: newStatus },
      include: { order: true },
    });

    // If all items in this order are served, update the order status
    const remainingUnserved = await prisma.orderItem.count({
      where: {
        orderId: updatedItem.orderId,
        kotStatus: { notIn: ["SERVED", "CANCELLED"] },
      },
    });

    if (remainingUnserved === 0) {
      await prisma.order.update({
        where: { id: updatedItem.orderId },
        data: { status: "SERVED" },
      });
    }

    return updatedItem;
  }

  /**
   * Toggle menu item availability (86-sold out button).
   */
  static async toggleMenuItemAvailability(itemId: string, available: boolean) {
    return await prisma.menuItem.update({
      where: { id: itemId },
      data: { available },
    });
  }
}
