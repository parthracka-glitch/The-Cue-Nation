import prisma from "@/lib/db";
import { computeTimeCharge } from "@/lib/pricing/time";
import { applyMembership } from "@/lib/pricing/membership";
import { computeBillTotals } from "@/lib/pricing/tax";
import { allocatePayments } from "@/lib/settlement";
import { logAudit } from "../utils/audit";

export interface SettleSessionPaymentInput {
  customerId?: string | null;
  method: string; // CASH | UPI | CARD | WALLET | CREDIT
  amountPaise: number;
  label?: string;
}

export interface SettleSessionInput {
  splitMode?: string;
  manualDiscountPaise?: number;
  discountReason?: string;
  payments: SettleSessionPaymentInput[];
  totals: {
    tableChargePaise: number;
    cafeChargePaise: number;
    subtotalPaise: number;
    discountPaise: number;
    taxPaise: number;
    totalPaise: number;
    depositCreditPaise?: number;
  };
}

export class BillingService {
  /**
   * Generates a complete checkout folio for a game session, calculating
   * time charges across rate bands, active cafe orders, membership discounts, and taxes.
   */
  static async getCheckoutFolio(sessionId: string) {
    const gameSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        table: {
          include: {
            rateCard: { include: { bands: true } },
          },
        },
        customer: {
          include: {
            memberships: {
              where: { endsAt: { gte: new Date() } },
              include: { plan: true },
            },
          },
        },
        pauses: { orderBy: { pausedAt: "asc" } },
        orders: {
          where: { status: { not: "CANCELLED" } },
          include: { items: true },
        },
        bill: true,
      },
    });

    if (!gameSession) {
      throw new Error("Session not found");
    }

    const now = gameSession.endedAt || new Date();

    let snapshotBands = gameSession.table.rateCard.bands;
    try {
      if (gameSession.rateCardSnapshot) {
        const parsed = JSON.parse(gameSession.rateCardSnapshot);
        if (parsed.bands) snapshotBands = parsed.bands;
      }
    } catch {
      // Fallback to table's active rate card bands
    }

    // 1. Compute table time charges
    const timeChargeResult = computeTimeCharge({
      start: gameSession.startedAt,
      end: now,
      pauses: gameSession.pauses,
      bands: snapshotBands,
      rateCard: {
        graceMinutes: gameSession.table.rateCard.graceMinutes,
        minChargeMinutes: gameSession.table.rateCard.minChargeMinutes,
        overtimeMultiplier: gameSession.table.rateCard.overtimeMultiplier,
      },
      timezone: "Asia/Kolkata",
    });

    // 2. Extract Cafe items
    const orderItems: Array<{
      id: string;
      name: string;
      unitPricePaise: number;
      quantity: number;
      assignedToCustomerId?: string | null;
      kotStatus: string;
    }> = [];

    gameSession.orders.forEach((order) => {
      order.items.forEach((item) => {
        orderItems.push({
          id: item.id,
          name: item.nameSnapshot,
          unitPricePaise: item.unitPricePaise,
          quantity: item.quantity,
          assignedToCustomerId: item.assignedToCustomerId,
          kotStatus: item.kotStatus,
        });
      });
    });

    // 3. Apply Membership discounts
    const activeMembership = gameSession.customer?.memberships?.[0];
    const membershipDiscountResult = applyMembership({
      subtotalPaise: timeChargeResult.totalPaise,
      tableChargePaise: timeChargeResult.totalPaise,
      sessionBillableMinutes: timeChargeResult.billableMinutes,
      membership: activeMembership
        ? {
            discountPercent: activeMembership.plan.discountPercent,
            includedMinutes: activeMembership.plan.includedMinutes,
            minutesUsed: activeMembership.minutesUsed,
            active: true,
          }
        : null,
    });

    // 4. Compute Totals (Table time + Cafe + Taxes)
    const billTotals = computeBillTotals({
      tableChargePaise: timeChargeResult.totalPaise,
      tableTaxPercent: 5.0,
      orderItems,
      discountPaise: membershipDiscountResult.discountPaise,
      defaultTaxPercent: 5.0,
    });

    return {
      session: {
        id: gameSession.id,
        tableId: gameSession.tableId,
        tableName: gameSession.table.name,
        tableType: gameSession.table.type,
        billingMode: gameSession.billingMode,
        startedAt: gameSession.startedAt,
        endedAt: now,
        framesPlayed: gameSession.framesPlayed,
        status: gameSession.status,
      },
      customer: gameSession.customer
        ? {
            id: gameSession.customer.id,
            name: gameSession.customer.name,
            phone: gameSession.customer.phone,
            walletBalance: gameSession.customer.walletBalance,
            creditBalance: gameSession.customer.creditBalance,
            creditLimit: gameSession.customer.creditLimit,
            remainingCreditLimit: Math.max(
              0,
              gameSession.customer.creditLimit - gameSession.customer.creditBalance
            ),
            membership: activeMembership ? activeMembership.plan.name : null,
          }
        : null,
      timeCharge: timeChargeResult,
      membershipDiscount: membershipDiscountResult,
      orderItems,
      totals: billTotals,
      isAlreadySettled: !!gameSession.bill && gameSession.bill.status === "PAID",
    };
  }

  /**
   * Settles a session, generates the Bill record, commits payments,
   * handles wallet/khata mutations, closes session, and flags table as dirty.
   */
  static async settleSession(sessionId: string, input: SettleSessionInput, staffUserId?: string) {
    const { splitMode = "NONE", manualDiscountPaise = 0, discountReason, payments, totals } = input;

    if (!payments || payments.length === 0) {
      throw new Error("At least one payment record is required");
    }

    const allocation = allocatePayments(totals.totalPaise, payments);
    if (allocation.totalPaidPaise < totals.totalPaise) {
      throw new Error(
        `Underpaid: Total required is ₹${totals.totalPaise / 100}, but payments sum to ₹${
          allocation.totalPaidPaise / 100
        }`
      );
    }

    const now = new Date();

    return await prisma.$transaction(async (tx) => {
      const gameSession = await tx.session.findUnique({
        where: { id: sessionId },
        include: {
          table: true,
          customer: true,
          reservation: true,
        },
      });

      if (!gameSession) {
        throw new Error("Session not found");
      }

      const bill = await tx.bill.create({
        data: {
          sessionId: gameSession.id,
          customerId: gameSession.customerId,
          status: "PAID",
          subtotalPaise: totals.subtotalPaise,
          discountPaise: (totals.discountPaise || 0) + (manualDiscountPaise || 0),
          taxPaise: totals.taxPaise ?? (totals as any).totalTaxPaise ?? 0,
          totalPaise: totals.totalPaise,
          splitMode,
          closedAt: now,
        },
      });

      const billCode = `INV-${bill.id.slice(-6).toUpperCase()}`;

      // Process individual payment lines
      for (const p of payments) {
        await tx.payment.create({
          data: {
            billId: bill.id,
            customerId: p.customerId || gameSession.customerId,
            method: p.method,
            amountPaise: p.amountPaise,
            label: p.label || null,
          },
        });

        // Debit Wallet balance
        if (p.method === "WALLET" && p.customerId) {
          await tx.customer.update({
            where: { id: p.customerId },
            data: { walletBalance: { decrement: p.amountPaise } },
          });

          await tx.ledgerEntry.create({
            data: {
              customerId: p.customerId,
              billId: bill.id,
              type: "WALLET_SPEND",
              amountPaise: p.amountPaise,
              note: `Paid for Bill #${billCode} via Wallet`,
            },
          });
        }

        // Charge Khata (Credit)
        if (p.method === "CREDIT" && p.customerId) {
          const cust = await tx.customer.update({
            where: { id: p.customerId },
            data: { creditBalance: { increment: p.amountPaise } },
          });

          await tx.ledgerEntry.create({
            data: {
              customerId: p.customerId,
              billId: bill.id,
              type: "CREDIT_GIVEN",
              amountPaise: p.amountPaise,
              note: `Khata credit on Bill #${billCode}`,
            },
          });
        }
      }

      // Finalize session
      await tx.session.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endedAt: now,
        },
      });

      // Mark game table dirty for sanitation
      await tx.gameTable.update({
        where: { id: gameSession.tableId },
        data: { status: "DIRTY" },
      });

      // Audit log entry
      await logAudit(
        {
          userId: staffUserId,
          action: "BILL_SETTLED",
          entity: "BILL",
          entityId: bill.id,
          meta: {
            billCode,
            totalPaise: totals.totalPaise,
            paymentsCount: payments.length,
            discountReason: discountReason || null,
          },
        },
        tx
      );

      return {
        bill,
        changePaise: allocation.changeDuePaise,
      };
    });
  }

  /**
   * Retrieves past bills list with optional status filtering.
   */
  static async getBillsList(statusFilter?: string | null) {
    const where: any = {};
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    return await prisma.bill.findMany({
      where,
      include: {
        customer: true,
        session: {
          include: {
            table: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  /**
   * Reopens or voids an existing bill.
   */
  static async refundOrReopenBill(billId: string, reason: string, staffUserId?: string) {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: { payments: true },
    });

    if (!bill) {
      throw new Error("Bill not found");
    }

    return await prisma.$transaction(async (tx) => {
      // Void / Reopen bill
      const updatedBill = await tx.bill.update({
        where: { id: billId },
        data: {
          status: "OPEN",
          closedAt: null,
        },
      });

      // Reverse wallet / credit transactions if any
      for (const p of bill.payments) {
        if (p.method === "CREDIT" && p.customerId) {
          await tx.customer.update({
            where: { id: p.customerId },
            data: { creditBalance: { decrement: p.amountPaise } },
          });
        } else if (p.method === "WALLET" && p.customerId) {
          await tx.customer.update({
            where: { id: p.customerId },
            data: { walletBalance: { increment: p.amountPaise } },
          });
        }
      }

      await logAudit(
        {
          userId: staffUserId,
          action: "BILL_VOIDED",
          entity: "BILL",
          entityId: billId,
          meta: { reason },
        },
        tx
      );

      return updatedBill;
    });
  }
}
