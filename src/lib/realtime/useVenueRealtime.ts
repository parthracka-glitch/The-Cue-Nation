"use client";

import { useEffect, useRef } from "react";
import { venueStore } from "@/lib/store/venueStore";
import { RealtimeEvent } from "@/lib/services/realtimeEmitter";

/**
 * Hook that listens to the unified backend SSE real-time stream (/api/realtime)
 * and keeps the local store and UI synchronized across Customer, Staff, and Admin tabs.
 */
export function useVenueRealtime(onEvent?: (event: RealtimeEvent) => void) {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Only in browser
    if (typeof window === "undefined") return;

    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    function connect() {
      try {
        const es = new EventSource("/api/realtime");
        eventSourceRef.current = es;

        es.addEventListener("venue_update", (e) => {
          if (!isMounted) return;
          try {
            const event: RealtimeEvent = JSON.parse(e.data);
            if (onEvent) onEvent(event);

            // Synchronize venueStore based on event type
            if (event.type === "TABLE_STATUS_CHANGED") {
              const { tableId, status } = event.data as { tableId: string; status: any };
              venueStore.setTableStatus(tableId, status);
            } else if (event.type === "BOOKING_CREATED" || event.type === "BOOKING_UPDATED") {
              // Refresh bookings from server
              fetch("/api/bookings")
                .then((r) => r.json())
                .then((d) => {
                  if (d.bookings) {
                    venueStore.setBookings(d.bookings);
                  }
                })
                .catch(() => {});
            } else if (event.type === "SESSION_STARTED" || event.type === "SESSION_ENDED") {
              fetch("/api/sessions")
                .then((r) => r.json())
                .then((d) => {
                  if (d.sessions) {
                    venueStore.setSessions(d.sessions);
                  }
                })
                .catch(() => {});
            }
          } catch {
            // ignore
          }
        });

        es.onerror = () => {
          es.close();
          if (isMounted) {
            retryTimeout = setTimeout(connect, 5000);
          }
        };
      } catch {
        if (isMounted) {
          retryTimeout = setTimeout(connect, 5000);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [onEvent]);
}
