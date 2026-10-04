import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Flame, Check, CheckCircle2 } from "lucide-react";
import { KDSTicketItem } from "@/client/api/kitchen.api";

interface TicketCardProps {
  ticket: KDSTicketItem;
  onAdvance: (id: string, newStatus: string) => void;
}

export function TicketCard({ ticket, onAdvance }: TicketCardProps) {
  const isUrgent = ticket.elapsedMinutes >= 15;
  const isWarning = ticket.elapsedMinutes >= 10 && !isUrgent;

  return (
    <div
      className={`rounded-xl border p-4 shadow-lg transition-all ${
        ticket.kotStatus === "NEW"
          ? isUrgent
            ? "border-red-500/80 bg-red-950/20"
            : isWarning
            ? "border-amber-500/60 bg-amber-950/20"
            : "border-slate-800 bg-slate-900/90"
          : ticket.kotStatus === "PREPARING"
          ? "border-amber-500/40 bg-slate-900/80"
          : "border-emerald-500/40 bg-emerald-950/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="font-bold text-base text-white">{ticket.tableName}</span>
          <span className="text-xs text-slate-400 block">{ticket.customerName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={`text-[11px] font-mono flex items-center gap-1 ${
              isUrgent
                ? "border-red-500/80 bg-red-500/20 text-red-300 animate-pulse"
                : isWarning
                ? "border-amber-500/60 bg-amber-500/20 text-amber-300"
                : "border-slate-700 text-slate-400"
            }`}
          >
            <Clock className="h-3 w-3" />
            {ticket.elapsedMinutes}m
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              ticket.station === "BAR"
                ? "border-sky-500/40 text-sky-400"
                : "border-amber-500/40 text-amber-400"
            }`}
          >
            {ticket.station}
          </Badge>
        </div>
      </div>

      <div className="my-3 py-2 border-y border-slate-800/80 flex items-center gap-3">
        <span className="text-2xl">{ticket.emoji || "🍽️"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-amber-400">{ticket.quantity}x</span>
            <span className="text-base font-medium text-slate-100 truncate">{ticket.itemName}</span>
          </div>
          {ticket.notes && (
            <p className="text-xs text-amber-300/90 italic mt-0.5 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
              Note: {ticket.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        {ticket.kotStatus === "NEW" && (
          <Button
            size="sm"
            onClick={() => onAdvance(ticket.id, "PREPARING")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-9 text-xs"
          >
            <Flame className="h-3.5 w-3.5 mr-1" />
            Start Preparing
          </Button>
        )}
        {ticket.kotStatus === "PREPARING" && (
          <Button
            size="sm"
            onClick={() => onAdvance(ticket.id, "READY")}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9 text-xs"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Mark Ready
          </Button>
        )}
        {ticket.kotStatus === "READY" && (
          <Button
            size="sm"
            onClick={() => onAdvance(ticket.id, "SERVED")}
            variant="outline"
            className="w-full border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40 h-9 text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Clear / Served
          </Button>
        )}
      </div>
    </div>
  );
}
