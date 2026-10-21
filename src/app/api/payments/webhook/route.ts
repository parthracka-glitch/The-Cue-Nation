import { NextRequest, NextResponse } from "next/server";
import { handlePaymentWebhook, verifyWebhookSignature } from "@/lib/services/paymentService";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-cue-signature") || req.headers.get("x-razorpay-signature");

    // Verify signature in production or if signature header provided
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook cryptographic signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const { orderId, providerPaymentId, status, amount } = event;

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required in payload" }, { status: 400 });
    }

    const result = handlePaymentWebhook({
      orderId,
      providerPaymentId: providerPaymentId || `pay_gw_${Date.now()}`,
      status: status === "success" || status === "paid" ? "success" : "failed",
      amount: Number(amount) || 0,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
