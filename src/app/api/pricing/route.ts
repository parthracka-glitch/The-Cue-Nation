import { NextRequest, NextResponse } from "next/server";
import { backendDataStore } from "@/lib/services/dataStore";
import { updatePricingRule, calculateAuthoritativePrice } from "@/lib/services/pricingService";
import { authenticateRequest } from "@/lib/services/authService";
import { broadcastEvent } from "@/lib/services/realtimeEmitter";
import { logAuditEvent } from "@/lib/services/auditService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const calculate = searchParams.get("calculate");
  const tableId = searchParams.get("tableId");
  const startISO = searchParams.get("startISO");
  const endISO = searchParams.get("endISO");

  if (calculate === "true" && tableId && startISO && endISO) {
    const calc = calculateAuthoritativePrice(tableId, startISO, endISO);
    return NextResponse.json(calc);
  }

  return NextResponse.json({
    pricing: backendDataStore.pricing,
    baseRates: {
      pool_hourly_rate: backendDataStore.settings.pool_hourly_rate,
      snooker_hourly_rate: backendDataStore.settings.snooker_hourly_rate,
      tax_percentage: backendDataStore.settings.tax_percentage,
    },
  });
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const user = authenticateRequest(authHeader);

  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, pool_hourly_rate, snooker_hourly_rate, tax_percentage, updates } = body;

    if (pool_hourly_rate !== undefined) {
      backendDataStore.settings.pool_hourly_rate = Number(pool_hourly_rate);
    }
    if (snooker_hourly_rate !== undefined) {
      backendDataStore.settings.snooker_hourly_rate = Number(snooker_hourly_rate);
    }
    if (tax_percentage !== undefined) {
      backendDataStore.settings.tax_percentage = Number(tax_percentage);
    }

    if (id && updates) {
      updatePricingRule(id, updates);
    }

    broadcastEvent("PRICING_UPDATED", {
      poolRate: backendDataStore.settings.pool_hourly_rate,
      snookerRate: backendDataStore.settings.snooker_hourly_rate,
    });

    logAuditEvent({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "PRICING_CONFIG_UPDATED",
      resourceType: "pricing",
      resourceId: id || "global",
      details: body,
    });

    return NextResponse.json({ success: true, settings: backendDataStore.settings, pricing: backendDataStore.pricing });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating pricing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
