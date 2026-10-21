import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-baize/15 text-baize flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="font-display text-4xl font-bold text-midnight">
        404 — Ball Off Table
      </h1>
      <p className="text-sm text-ash max-w-sm">
        The shot went wide or the page was scratched. Let&apos;s get you back to the main baize.
      </p>
      <div className="pt-2">
        <Link href="/">
          <Button variant="primary" size="md">
            Return to Parlour Lounge
          </Button>
        </Link>
      </div>
    </div>
  );
}
