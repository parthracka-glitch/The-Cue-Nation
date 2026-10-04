import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: {
        items: { orderBy: { name: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { type, name, categoryId, pricePaise, emoji, station } = await req.json();

    if (type === "CATEGORY") {
      const cat = await prisma.menuCategory.create({
        data: {
          name,
          station: station || "KITCHEN",
        },
      });
      return NextResponse.json(cat, { status: 201 });
    }

    if (type === "ITEM") {
      const item = await prisma.menuItem.create({
        data: {
          categoryId,
          name,
          pricePaise,
          imageEmoji: emoji || "🍽️",
          available: true,
        },
      });
      return NextResponse.json(item, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}

// Toggle availability (86 an item)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, available } = await req.json();

    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: { available },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update item availability" }, { status: 500 });
  }
}
