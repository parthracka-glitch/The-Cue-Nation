import { NextRequest } from "next/server";
import { realtimeEmitter, RealtimeEvent } from "@/lib/services/realtimeEmitter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", time: new Date().toISOString() })}\n\n`)
      );

      const onVenueEvent = (event: RealtimeEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`event: venue_update\ndata: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          realtimeEmitter.off("venue_event", onVenueEvent);
        }
      };

      realtimeEmitter.on("venue_event", onVenueEvent);

      // Heartbeat ping every 15 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
          realtimeEmitter.off("venue_event", onVenueEvent);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        realtimeEmitter.off("venue_event", onVenueEvent);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
