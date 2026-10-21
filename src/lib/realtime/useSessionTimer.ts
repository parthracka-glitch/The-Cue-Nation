"use client";

import { useEffect, useState } from "react";

export interface SessionTimerResult {
  elapsedSec: number;
  formattedElapsed: string;
  extraMinutes: number;
  isOvertime: boolean;
  totalAllocatedSec: number;
}

export function useSessionTimer(
  startedAtISO?: string | null,
  allocatedMinutes: number = 60,
  extraMinutes: number = 0
): SessionTimerResult {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!startedAtISO) {
    return {
      elapsedSec: 0,
      formattedElapsed: "00:00",
      extraMinutes,
      isOvertime: false,
      totalAllocatedSec: (allocatedMinutes + extraMinutes) * 60,
    };
  }

  const startTime = new Date(startedAtISO).getTime();
  const elapsedSec = Math.max(0, Math.floor((now - startTime) / 1000));
  const totalAllocatedSec = (allocatedMinutes + extraMinutes) * 60;
  const isOvertime = elapsedSec > totalAllocatedSec;

  const hours = Math.floor(elapsedSec / 3600);
  const minutes = Math.floor((elapsedSec % 3600) / 60);
  const seconds = elapsedSec % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formattedElapsed =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  return {
    elapsedSec,
    formattedElapsed,
    extraMinutes,
    isOvertime,
    totalAllocatedSec,
  };
}
