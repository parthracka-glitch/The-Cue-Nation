import prisma from "@/lib/db";
import { logAudit } from "../utils/audit";

export class CustomerService {
  /**
   * Retrieves customers list with optional filter and search keyword.
   */
  static async getCustomers(filter?: string | null, search?: string | null) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (filter === "CREDIT") {
      where.creditBalance = { gt: 0 };
    } else if (filter === "MEMBER") {
      where.memberships = { some: { endsAt: { gte: new Date() } } };
    } else if (filter === "RISK") {
      where.creditBalance = { gte: 250000 }; // ₹2,500+ credit
    }

    return await prisma.customer.findMany({
      where,
      include: {
        memberships: {
          where: { endsAt: { gte: new Date() } },
          include: { plan: true },
        },
      },
      orderBy: { name: "asc" },
      take: 100,
    });
  }

  /**
   * Retrieves detailed customer profile, including ledger and active membership.
   */
  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { plan: true },
        },
        ledgerEntries: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        sessions: {
          include: { table: true, bill: true },
          orderBy: { startedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    return customer;
  }

  /**
   * Tops up customer digital wallet, applying the 10% bonus rule for topups >= ₹1,000.
   */
  static async topUpWallet(
    customerId: string,
    amountPaise: number,
    paymentMethod = "UPI",
    staffUserId?: string
  ) {
    if (amountPaise <= 0) {
      throw new Error("Invalid topup amount");
    }

    // 10% bonus credit promotion for recharges >= ₹1,000 (100,000 paise)
    const bonusPaise = amountPaise >= 100000 ? Math.floor(amountPaise * 0.1) : 0;
    const totalCreditPaise = amountPaise + bonusPaise;

    return await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.update({
        where: { id: customerId },
        data: {
          walletBalance: { increment: totalCreditPaise },
        },
      });

      await tx.ledgerEntry.create({
        data: {
          customerId,
          type: "WALLET_TOPUP",
          amountPaise: totalCreditPaise,
          note: `Wallet Recharge: ₹${amountPaise / 100} via ${paymentMethod}${
            bonusPaise > 0 ? ` (+₹${bonusPaise / 100} 10% bonus)` : ""
          }`,
        },
      });

      await logAudit(
        {
          userId: staffUserId,
          action: "WALLET_TOPUP",
          entity: "CUSTOMER",
          entityId: customerId,
          meta: { amountPaise, bonusPaise, totalCreditPaise, method: paymentMethod },
        },
        tx
      );

      return {
        customer,
        amountPaise,
        bonusPaise,
        totalCreditPaise,
      };
    });
  }

  /**
   * Records a Khata credit repayment at the counter.
   */
  static async recordKhataRepayment(
    customerId: string,
    amountPaise: number,
    paymentMethod = "UPI",
    notes?: string,
    staffUserId?: string
  ) {
    if (amountPaise <= 0) {
      throw new Error("Invalid repayment amount");
    }

    return await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.update({
        where: { id: customerId },
        data: { creditBalance: { decrement: amountPaise } },
      });

      await tx.ledgerEntry.create({
        data: {
          customerId,
          type: "CREDIT_REPAID",
          amountPaise,
          note: `${paymentMethod} Repayment: ${notes || "Counter payment received"}`,
        },
      });

      await tx.notification.create({
        data: {
          to: customer.phone,
          channel: "WHATSAPP",
          body: `🎱 [CueClub Receipt] Hi ${customer.name}, received ₹${
            amountPaise / 100
          } via ${paymentMethod}. Remaining Khata balance: ₹${customer.creditBalance / 100}. Thank you!`,
        },
      });

      await logAudit(
        {
          userId: staffUserId,
          action: "KHATA_REPAYMENT",
          entity: "CUSTOMER",
          entityId: customerId,
          meta: { amountPaise, method: paymentMethod },
        },
        tx
      );

      return customer;
    });
  }

  /**
   * Sends an automated SMS/WhatsApp Khata balance reminder.
   */
  static async sendKhataReminder(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    return await prisma.notification.create({
      data: {
        to: customer.phone,
        channel: "WHATSAPP",
        body: `🎱 [CueClub Reminder] Hi ${customer.name}, your current outstanding Khata balance is ₹${
          customer.creditBalance / 100
        }. You can repay at the counter or via UPI QR. Thank you!`,
      },
    });
  }
}
