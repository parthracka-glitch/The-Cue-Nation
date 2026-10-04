import { NextRequest, NextResponse } from "next/server";
import { ReservationService } from "@/server/services/reservation.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableType = (searchParams.get("type") || "POOL").toUpperCase();
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const durationHours = parseInt(searchParams.get("duration") || "1", 10);

    const result = await ReservationService.checkAvailability(tableType, dateStr, durationHours);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Availability query failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to check slot availability" },
      { status: 500 }
    );
  }
}
