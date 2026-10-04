import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { kitchenApi, KDSTicketItem } from "../api/kitchen.api";

export function useKitchenTickets(stationFilter = "ALL", soundEnabled = true) {
  const previousTicketCount = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    [`/api/kitchen/tickets`, stationFilter],
    () => kitchenApi.getTickets(stationFilter),
    {
      refreshInterval: 4000,
      revalidateOnFocus: true,
    }
  );

  const playChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const tickets = data?.items || [];

  useEffect(() => {
    if (tickets.length > previousTicketCount.current && soundEnabled && previousTicketCount.current !== 0) {
      playChime();
    }
    previousTicketCount.current = tickets.length;
  }, [tickets.length, soundEnabled]);

  const advanceItem = async (orderItemId: string, newStatus: string) => {
    await kitchenApi.advanceItemStatus(orderItemId, newStatus);
    mutate();
  };

  return {
    tickets,
    isLoading,
    error,
    refresh: mutate,
    advanceItem,
    playChime,
  };
}
