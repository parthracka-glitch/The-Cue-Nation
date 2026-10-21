"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface BookedSlotRecord {
  booking_id: string;
  table_id: string;
  during: string;
}

export function useAvailability(
  tableId: string,
  dayStartISO: string,
  dayEndISO: string
) {
  const [booked, setBooked] = useState<BookedSlotRecord[]>([]);
  const [live, setLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!tableId || !dayStartISO || !dayEndISO) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("booked_slots")
        .select("*")
        .eq("table_id", tableId)
        .overlaps("during", `[${dayStartISO},${dayEndISO})`);

      if (!error && data) {
        setBooked(data as BookedSlotRecord[]);
      }
    } catch {
      // Graceful fallback for local offline simulation
    } finally {
      setIsLoading(false);
    }
  }, [tableId, dayStartISO, dayEndISO]);

  useEffect(() => {
    let active = true;
    load();

    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;

    try {
      const supabase = createClient();
      channel = supabase
        .channel(`slots:${tableId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "booked_slots",
            filter: `table_id=eq.${tableId}`,
          },
          () => {
            if (active) load();
          }
        )
        .subscribe((status) => {
          if (active) {
            setLive(status === "SUBSCRIBED");
            if (status === "SUBSCRIBED") load();
          }
        });
    } catch {
      // Realtime channel creation failed (e.g. offline)
    }

    // Safety net fallback poll every 30 seconds
    const poll = setInterval(() => {
      if (active) load();
    }, 30_000);

    return () => {
      active = false;
      clearInterval(poll);
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [tableId, load]);

  return { booked, live, isLoading, refetch: load };
}
