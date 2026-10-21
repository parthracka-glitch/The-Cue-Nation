import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { getPoolDaySchedule } from "@/lib/services/poolScheduleService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    const { searchParams } = new URL(req.url);

    const dateParam = searchParams.get("date");
    const durationParam = searchParams.get("duration");

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const durationMinutes = durationParam ? parseInt(durationParam, 10) : 60;

    const schedule = getPoolDaySchedule(poolId, targetDate, durationMinutes);
    const pool = backendDataStore.pools.find((p) => p.id === poolId);

    return NextResponse.json({
      pool,
      schedule,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load pool schedule";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    const body = await req.json();

    const pool = backendDataStore.pools.find((p) => p.id === poolId);
    if (!pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    if (body.opening_time) pool.opening_time = body.opening_time;
    if (body.closing_time) pool.closing_time = body.closing_time;
    if (body.hourly_rate !== undefined) pool.hourly_rate = Number(body.hourly_rate);
    if (body.status) pool.status = body.status;
    if (body.is_active !== undefined) pool.is_active = Boolean(body.is_active);
    if (body.name) pool.name = body.name;
    if (body.description) pool.description = body.description;
    pool.updated_at = new Date().toISOString();

    // Also update corresponding game table
    const table = backendDataStore.tables.find((t) => t.id === poolId);
    if (table) {
      if (body.status) table.status = body.status;
      if (body.is_active !== undefined) table.active = Boolean(body.is_active);
      if (body.opening_time) table.opening_time = body.opening_time;
      if (body.closing_time) table.closing_time = body.closing_time;
      if (body.hourly_rate) table.hourly_rate = Number(body.hourly_rate);
    }

    return NextResponse.json({ success: true, pool });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update pool";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
