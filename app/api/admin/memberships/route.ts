import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.membershipPlan.findMany({
      include: {
        _count: { select: { memberships: true } },
      },
    });

    const activeMembers = await prisma.customerMembership.findMany({
      where: { endsAt: { gte: new Date() } },
      include: {
        customer: true,
        plan: true,
      },
      orderBy: { endsAt: "asc" },
    });

    const customers = await prisma.customer.findMany({
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ plans, activeMembers, customers });
  } catch {
    return NextResponse.json({ error: "Failed to load memberships" }, { status: 500 });
  }
}

// Sell membership to customer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { customerId, planId } = await req.json();

    const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });

    if (!plan || !customer) {
      return NextResponse.json({ error: "Invalid plan or customer" }, { status: 400 });
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + plan.durationDays * 86400000);

    const membership = await prisma.$transaction(async (tx) => {
      const created = await tx.customerMembership.create({
        data: {
          customerId,
          planId,
          startsAt: now,
          endsAt,
          minutesUsed: 0,
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          to: customer.phone,
          channel: "WHATSAPP",
          body: `🎱 [CueClub VIP] Welcome to ${plan.name}! Your membership is active until ${endsAt.toLocaleDateString("en-IN")}. Enjoy ${plan.discountPercent}% OFF table time!`,
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, membership }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to sell membership" }, { status: 500 });
  }
}
