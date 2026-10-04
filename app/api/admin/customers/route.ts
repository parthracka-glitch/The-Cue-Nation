import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // ALL | CREDIT | MEMBER | RISK | TOP
    const search = searchParams.get("search")?.toLowerCase();

    const customers = await prisma.customer.findMany({
      include: {
        memberships: {
          where: { endsAt: { gte: new Date() } },
          include: { plan: true },
        },
        bills: {
          where: { status: "PAID" },
          select: { totalPaise: true, createdAt: true },
        },
        sessions: {
          select: { startedAt: true },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let formatted = customers.map((c) => {
      const lifetimeSpendPaise = c.bills.reduce((acc, b) => acc + b.totalPaise, 0);
      const visitsCount = c.bills.length;
      const lastVisit = c.sessions[0]?.startedAt || c.createdAt;
      const activeMembership = c.memberships[0]?.plan.name || null;
      const creditUtilization = c.creditLimit > 0 ? (c.creditBalance / c.creditLimit) * 100 : 0;
      const isCreditRisk = creditUtilization >= 80;

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        walletBalance: c.walletBalance,
        creditBalance: c.creditBalance,
        creditLimit: c.creditLimit,
        loyaltyPoints: c.loyaltyPoints,
        lifetimeSpendPaise,
        visitsCount,
        lastVisit,
        activeMembership,
        creditUtilization,
        isCreditRisk,
      };
    });

    if (search) {
      formatted = formatted.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.phone.includes(search) ||
          (c.email && c.email.toLowerCase().includes(search))
      );
    }

    if (filter === "CREDIT") {
      formatted = formatted.filter((c) => c.creditBalance > 0);
    } else if (filter === "MEMBER") {
      formatted = formatted.filter((c) => !!c.activeMembership);
    } else if (filter === "RISK") {
      formatted = formatted.filter((c) => c.isCreditRisk);
    } else if (filter === "TOP") {
      formatted.sort((a, b) => b.lifetimeSpendPaise - a.lifetimeSpendPaise);
      formatted = formatted.slice(0, 10);
    }

    return NextResponse.json({ customers: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load customers" },
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

    const { name, phone, email, notes, creditLimit = 500000 } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({
      where: { phone: phone.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A customer with this phone number already exists" },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        notes: notes ? notes.trim() : null,
        creditLimit,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}
