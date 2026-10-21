import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { PoolClosure } from "@/types/database";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    const closures = backendDataStore.poolClosures.filter((c) => c.pool_id === poolId);
    return NextResponse.json({ closures });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch closures";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { poolId } = await params;
    const body = await req.json();
    const { start_datetime, end_datetime, reason } = body;

    if (!start_datetime || !end_datetime || !reason) {
      return NextResponse.json(
        { error: "start_datetime, end_datetime, and reason are required" },
        { status: 400 }
      );
    }

    const closure: PoolClosure = {
      id: `closure-${Date.now()}`,
      pool_id: poolId,
      start_datetime,
      end_datetime,
      reason,
      created_at: new Date().toISOString(),
    };

    backendDataStore.poolClosures.push(closure);

    // If closure is right now, update table/pool status to maintenance
    const nowMs = Date.now();
    const startMs = new Date(start_datetime).getTime();
    const endMs = new Date(end_datetime).getTime();
    if (nowMs >= startMs && nowMs < endMs) {
      const pool = backendDataStore.pools.find((p) => p.id === poolId);
      if (pool) pool.status = "maintenance";
      const table = backendDataStore.tables.find((t) => t.id === poolId);
      if (table) table.status = "maintenance";
    }

    return NextResponse.json({ success: true, closure }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to add closure";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ poolId: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const closureId = searchParams.get("closureId");
    if (!closureId) {
      return NextResponse.json({ error: "closureId is required" }, { status: 400 });
    }

    backendDataStore.poolClosures = backendDataStore.poolClosures.filter((c) => c.id !== closureId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to remove closure";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
