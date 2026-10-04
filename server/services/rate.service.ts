import prisma from "@/lib/db";
import { computeTimeCharge } from "@/lib/pricing/time";

export interface SimulateRateInput {
  rateCardId: string;
  startTime: string; // ISO string
  durationHours: number;
}

export class RateService {
  /**
   * Retrieves all rate cards with their rate bands and assigned tables.
   */
  static async getRateCards() {
    return await prisma.rateCard.findMany({
      include: {
        bands: { orderBy: { startMinute: "asc" } },
        tables: true,
      },
    });
  }

  /**
   * Simulates dynamic time pricing across day/happy-hour/evening/weekend bands.
   */
  static async simulateRate(input: SimulateRateInput) {
    const rateCard = await prisma.rateCard.findUnique({
      where: { id: input.rateCardId },
      include: { bands: true },
    });

    if (!rateCard) {
      throw new Error("Rate card not found");
    }

    const start = new Date(input.startTime);
    const end = new Date(start.getTime() + input.durationHours * 3600000);

    const result = computeTimeCharge({
      start,
      end,
      bands: rateCard.bands,
      rateCard: {
        graceMinutes: rateCard.graceMinutes,
        minChargeMinutes: rateCard.minChargeMinutes,
        overtimeMultiplier: rateCard.overtimeMultiplier,
      },
      timezone: "Asia/Kolkata",
    });

    return {
      rateCardName: rateCard.name,
      start,
      end,
      durationHours: input.durationHours,
      result,
    };
  }
}
