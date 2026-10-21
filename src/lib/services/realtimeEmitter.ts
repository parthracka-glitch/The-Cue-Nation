import { EventEmitter } from "events";

export interface RealtimeEvent {
  type:
    | "TABLE_STATUS_CHANGED"
    | "BOOKING_CREATED"
    | "BOOKING_UPDATED"
    | "BOOKING_CANCELLED"
    | "SLOT_HELD"
    | "SESSION_STARTED"
    | "SESSION_EXTENDED"
    | "SESSION_ENDED"
    | "ORDER_CREATED"
    | "ORDER_STATUS_CHANGED"
    | "BILL_PAID"
    | "PAYMENT_RECORDED"
    | "PRICING_UPDATED"
    | "STAFF_UPDATED"
    | "MAINTENANCE_LOGGED"
    | "SETTING_UPDATED";
  timestamp: string;
  data: Record<string, unknown>;
}

// Global singleton event emitter across Next.js API routes
declare global {
  // eslint-disable-next-line no-var
  var __realtimeEmitter: EventEmitter | undefined;
}

export const realtimeEmitter: EventEmitter = globalThis.__realtimeEmitter || new EventEmitter();
realtimeEmitter.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  globalThis.__realtimeEmitter = realtimeEmitter;
}

export function broadcastEvent(
  type: RealtimeEvent["type"],
  data: Record<string, unknown>
) {
  const event: RealtimeEvent = {
    type,
    timestamp: new Date().toISOString(),
    data,
  };
  realtimeEmitter.emit("venue_event", event);
}
