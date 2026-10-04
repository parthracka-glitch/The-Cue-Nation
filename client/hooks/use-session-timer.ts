import { useState, useEffect } from "react";

export function useSessionTimer(startedAt: string | Date | null | undefined, isPaused = false) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(startedAt).getTime();

    const updateTimer = () => {
      const nowMs = Date.now();
      const diffSecs = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();

    if (isPaused) return;

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startedAt, isPaused]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;

  return {
    elapsedSeconds,
    elapsedMinutes: Math.floor(elapsedSeconds / 60),
    hours,
    minutes,
    seconds,
    formattedTime,
  };
}
