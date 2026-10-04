import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        memberships: {
          include: { plan: true },
          orderBy: { endsAt: "desc" },
        },
        sessions: {
          include: { table: true },
          orderBy: { startedAt: "desc" },
          take: 10,
        },
        bills: {
          include: { payments: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        ledgerEntries: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Calculate favorites
    const tableTypeCounts: Record<string, number> = {};
    customer.sessions.forEach((s) => {
      tableTypeCounts[s.table.type] = (tableTypeCounts[s.table.type] || 0) + 1;
    });

    let favoriteTableType = "POOL";
    let maxCount = 0;
    Object.entries(tableTypeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteTableType = type;
      }
    });

    const lifetimeSpendPaise = customer.bills.reduce((acc, b) => acc + b.totalPaise, 0);
    const averageSpendPaise =
      customer.bills.length > 0 ? Math.round(lifetimeSpendPaise / customer.bills.length) : 0;

    return NextResponse.json({
      customer,
      overview: {
        favoriteTableType,
        averageSpendPaise,
        lifetimeSpendPaise,
        totalVisits: customer.bills.length,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load customer profile" }, { status: 500 });
  }
}

// Wallet Top-up with bonus rule or customer edit
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, topUpPaise, method = "UPI", notes, creditLimit } = await req.json();

    if (action === "WALLET_TOPUP") {
      if (!topUpPaise || topUpPaise <= 0) {
        return NextResponse.json({ error: "Invalid top-up amount" }, { status: 400 });
      }

      // Wallet bonus rule: if top up >= Rs 1000 (100000 paise), get Rs 100 (10000 paise) bonus
      let bonusPaise = 0;
      if (topUpPaise >= 100000) {
        bonusPaise = Math.round(topUpPaise * 0.1); // 10% bonus
      }

      const totalCreditedPaise = topUpPaise + bonusPaise;

      const updated = await prisma.$transaction(async (tx) => {
        const c = await tx.customer.update({
          where: { id: params.id },
          data: {
            walletBalance: { increment: totalCreditedPaise },
          },
        });

        // Record main topup
        await tx.ledgerEntry.create({
          data: {
            customerId: params.id,
            type: "WALLET_TOPUP",
            amountPaise: topUpPaise,
            note: `${method} Top-up added at counter`,
          },
        });

        // Record promotional bonus if earned
        if (bonusPaise > 0) {
          await tx.ledgerEntry.create({
            data: {
              customerId: params.id,
              type: "WALLET_TOPUP",
              amountPaise: bonusPaise,
              note: `🎁 Promotional Wallet Bonus (10% on ${topUpPaise / 100} top-up)`,
            },
          });
        }

        return c;
      });

      return NextResponse.json({ success: true, customer: updated, bonusPaise });
    }

    if (action === "UPDATE_PROFILE") {
      const updated = await prisma.customer.update({
        where: { id: params.id },
        data: {
          notes: notes !== undefined ? notes : undefined,
          creditLimit: creditLimit !== undefined ? creditLimit : undefined,
        },
      });
      return NextResponse.json({ success: true, customer: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}
