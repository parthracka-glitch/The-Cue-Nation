import React from "react";
import { KDSTicketItem } from "@/client/api/kitchen.api";
import { TicketCard } from "./ticket-card";

interface KDSBoardProps {
  tickets: KDSTicketItem[];
  onAdvanceItem: (id: string, newStatus: string) => void;
}

export function KDSBoard({ tickets, onAdvanceItem }: KDSBoardProps) {
  const newTickets = tickets.filter((t) => t.kotStatus === "NEW");
  const preparingTickets = tickets.filter((t) => t.kotStatus === "PREPARING");
  const readyTickets = tickets.filter((t) => t.kotStatus === "READY");

  const columns = [
    {
      title: "NEW ORDERS",
      count: newTickets.length,
      color: "border-sky-500/50 bg-sky-950/20 text-sky-400",
      tickets: newTickets,
    },
    {
      title: "PREPARING",
      count: preparingTickets.length,
      color: "border-amber-500/50 bg-amber-950/20 text-amber-400",
      tickets: preparingTickets,
    },
    {
      title: "READY TO SERVE",
      count: readyTickets.length,
      color: "border-emerald-500/50 bg-emerald-950/20 text-emerald-400",
      tickets: readyTickets,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => (
        <div
          key={col.title}
          className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-4 min-h-[600px]"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-black tracking-wider uppercase text-slate-300">
              {col.title}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.color}`}>
              {col.count}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {col.tickets.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs italic">
                No orders in this column
              </div>
            ) : (
              col.tickets.map((t) => (
                <TicketCard key={t.id} ticket={t} onAdvance={onAdvanceItem} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
