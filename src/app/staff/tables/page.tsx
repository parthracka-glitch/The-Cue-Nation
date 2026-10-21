"use client";

import React, { useState, useEffect } from "react";
import { StaffNav } from "@/components/staff/StaffNav";
import { venueStore } from "@/lib/store/venueStore";
import { GameTable, TableStatus } from "@/types/database";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import {
  Layers,
  Wrench,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export default function StaffTablesPage() {
  const [tables, setTables] = useState<GameTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<GameTable | null>(null);
  const [statusModal, setStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<TableStatus>("free");

  const reload = () => {
    setTables(venueStore.getTables());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    venueStore.setTableStatus(selectedTable.id, targetStatus);
    setStatusModal(false);
    setSelectedTable(null);
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <Layers className="w-3.5 h-3.5" />
                Floor Table Allocation & Status
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Venue Table Grid
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/staff">
                <Button variant="secondary-dark" size="sm" className="gap-2">
                  <Play className="w-3.5 h-3.5 text-baize-light" />
                  Floor Timer Matrix
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-midnight-card border border-midnight-line p-4 rounded-xl">
              <span className="text-xs text-mist font-semibold">Total Tables</span>
              <div className="font-display text-2xl font-bold text-cream mt-1">{tables.length}</div>
            </div>
            <div className="bg-midnight-card border border-midnight-line p-4 rounded-xl">
              <span className="text-xs text-baize-light font-semibold">Available (Free)</span>
              <div className="font-display text-2xl font-bold text-baize-light mt-1">
                {tables.filter((t) => t.status === "free").length}
              </div>
            </div>
            <div className="bg-midnight-card border border-midnight-line p-4 rounded-xl">
              <span className="text-xs text-amber font-semibold">In Play (Running)</span>
              <div className="font-display text-2xl font-bold text-amber mt-1">
                {tables.filter((t) => t.status === "running").length}
              </div>
            </div>
            <div className="bg-midnight-card border border-midnight-line p-4 rounded-xl">
              <span className="text-xs text-mist font-semibold">Under Maintenance</span>
              <div className="font-display text-2xl font-bold text-slate-400 mt-1">
                {tables.filter((t) => t.status === "maintenance").length}
              </div>
            </div>
          </div>

          {/* Tables Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => {
              const isSnooker = table.type === "snooker";
              return (
                <div
                  key={table.id}
                  className="bg-midnight-card border border-midnight-line rounded-2xl p-6 flex flex-col justify-between shadow-card hover:border-bronze-glow/40 transition-all space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-bronze-glow">
                        {isSnooker ? "12ft Tournament Snooker" : "9ft Match Pool"}
                      </span>
                      <StatusBadge status={table.status} isDark />
                    </div>

                    <h3 className="font-display text-xl font-bold text-cream">
                      {table.name}
                    </h3>

                    <div className="text-xs text-mist space-y-1">
                      <div>Rate: ₹{isSnooker ? 500 : 350} / hour</div>
                      <div>Secret Token: <code className="text-cream">{table.qr_secret}</code></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-midnight-line flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTable(table);
                        setTargetStatus(table.status);
                        setStatusModal(true);
                      }}
                      className="text-xs text-mist hover:text-cream border-midnight-line w-full"
                    >
                      Update Operational Status
                    </Button>

                    {table.status === "running" && (
                      <Link href="/staff/sessions" className="shrink-0">
                        <Button variant="secondary-dark" size="sm" className="gap-1 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-bronze-glow" />
                          Timer
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        title="Update Table Operational Status"
      >
        {selectedTable && (
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-left">
            <div>
              <span className="text-xs text-mist">Target Table:</span>
              <div className="font-display text-lg font-bold text-cream">{selectedTable.name}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-2">
                Select Operational Status:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["free", "booked", "running", "maintenance"] as TableStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTargetStatus(st)}
                    className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      targetStatus === st
                        ? "bg-bronze-glow text-midnight border-bronze-glow shadow-sm"
                        : "bg-midnight border-midnight-line text-mist hover:text-cream"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" size="sm" type="button" onClick={() => setStatusModal(false)}>
                Cancel
              </Button>
              <Button variant="primary-dark" size="sm" type="submit" className="font-bold">
                Apply Status Change
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
