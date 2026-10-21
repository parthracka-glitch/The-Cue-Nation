"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error cleanly
    console.error("App boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-cue/15 text-cue flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="font-display text-3xl font-bold text-midnight">
        Foul On the Play
      </h1>
      <p className="text-sm text-ash max-w-sm">
        An unexpected shot deviation occurred. Reset the table state to try again.
      </p>
      <div className="pt-2">
        <Button variant="primary" size="md" onClick={() => reset()}>
          Reset Table & Retry
        </Button>
      </div>
    </div>
  );
}
