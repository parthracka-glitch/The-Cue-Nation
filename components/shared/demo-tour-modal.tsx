"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

interface DemoTourModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemoTourModal({ open, onOpenChange }: DemoTourModalProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const tourSteps = [
    {
      id: 1,
      title: "1. Public Website & Online Booking",
      desc: "Visit the customer landing page, inspect live table availability, and complete a 5-step booking with simulated UPI deposit.",
      href: "/book",
      badge: "Public Site",
    },
    {
      id: 2,
      title: "2. Floor Live View & Table Check-in",
      desc: "Observe real-time table cards ticking live, start a walk-in or check in the reservation on Pool 3, and watch the dynamic rate proration.",
      href: "/admin",
      badge: "Staff Console",
    },
    {
      id: 3,
      title: "3. Cafe POS & Kitchen Order (KOT)",
      desc: "Add F&B items (Espresso, Fries, Burger) directly to the table session tab and send tickets to the kitchen.",
      href: "/admin/pos",
      badge: "POS Drawer",
    },
    {
      id: 4,
      title: "4. Live Kitchen Display (KDS)",
      desc: "Switch to /kitchen in a separate window to view tickets by station, advance from NEW to PREPARING to READY, and see notification chips on the Floor card.",
      href: "/kitchen",
      badge: "Kitchen Display",
    },
    {
      id: 5,
      title: "5. Unified Checkout & 'Loser-Pays' Split",
      desc: "Conclude table session, select Loser-Pays mode for 3 players, settle table time to the loser, and record cash/UPI/credit khata shares.",
      href: "/admin",
      badge: "Settlement",
    },
    {
      id: 6,
      title: "6. Business Analytics & Day-Close Report",
      desc: "Review table utilization heatmaps, rate band revenue uplift, customer khata aging, and finalize the cash register day close.",
      href: "/admin/reports",
      badge: "Admin Analytics",
    },
  ];

  function toggleStep(id: number) {
    if (completedSteps.includes(id)) {
      setCompletedSteps(completedSteps.filter((s) => s !== id));
    } else {
      setCompletedSteps([...completedSteps, id]);
    }
  }

  const progress = Math.round((completedSteps.length / tourSteps.length) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-emerald-900/60 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <DialogTitle className="text-xl">CueClub 10-Minute Guided Demo</DialogTitle>
            </div>
            <Badge variant="gold">{progress}% Completed</Badge>
          </div>
          <DialogDescription className="text-muted-foreground">
            Follow this 6-step playbook to demonstrate the full loop from online booking to kitchen execution, loser-pays split settlement, and management reports.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {tourSteps.map((step) => {
            const isDone = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  isDone
                    ? "border-emerald-800/60 bg-emerald-950/20"
                    : "border-border bg-secondary/30 hover:border-emerald-700/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleStep(step.id)}
                      className="mt-0.5 text-muted-foreground hover:text-white transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            isDone ? "line-through text-muted-foreground" : "text-white"
                          }`}
                        >
                          {step.title}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {step.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={step.href}
                    onClick={() => onOpenChange(false)}
                    className="shrink-0 p-2 rounded-lg bg-secondary hover:bg-primary/20 text-emerald-300 hover:text-emerald-200 transition-colors"
                    title="Jump to stage"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCompletedSteps([])}
            className="text-xs text-muted-foreground"
          >
            Reset Checklist
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Continue Demo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
