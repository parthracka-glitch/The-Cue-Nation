import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { getPoolDaySchedule } from "@/lib/services/poolScheduleService";

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const pools = backendDataStore.pools.map((p) => {
      const schedule = getPoolDaySchedule(p.id, today, 60);
      return {
        ...p,
        scheduleSummary: schedule.summary,
        isCurrentlyClosed: schedule.isCurrentlyClosed,
        nextOpeningTimeLabel: schedule.nextOpeningTimeLabel,
      };
    });

    return NextResponse.json({ pools });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load pools";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, tagline, description, image_url, opening_time, closing_time, hourly_rate } = body;

    if (!name || !opening_time || !closing_time || !hourly_rate) {
      return NextResponse.json(
        { error: "Pool name, opening time, closing time, and hourly rate are required" },
        { status: 400 }
      );
    }

    const poolId = id || `pool-${Date.now()}`;
    const newPool = {
      id: poolId,
      name,
      tagline: tagline || "",
      description: description || "",
      image_url: image_url || "/images/venue-background.jpg",
      type: "pool" as const,
      category: "main" as const,
      opening_time,
      closing_time,
      booking_duration_options: [60, 90, 120],
      hourly_rate: Number(hourly_rate),
      is_active: true,
      status: "free" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    backendDataStore.pools.push(newPool);
    return NextResponse.json({ success: true, pool: newPool }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create pool";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
