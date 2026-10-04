import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RateService } from "@/server/services/rate.service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCards = await RateService.getRateCards();
    return NextResponse.json({ rateCards });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load rate cards" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { rateCardId, startTime, durationHours } = await req.json();

    const simulation = await RateService.simulateRate({
      rateCardId,
      startTime,
      durationHours,
    });

    return NextResponse.json(simulation);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Price simulation failed" },
      { status: 500 }
    );
  }
}
