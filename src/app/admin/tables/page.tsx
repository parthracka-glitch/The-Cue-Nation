"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { venueStore } from "@/lib/store/venueStore";
import { GameTable, TableType, TableStatus, PoolClosure } from "@/types/database";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Layers,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Clock,
  Wrench,
  DollarSign,
  Calendar,
  Trash2,
} from "lucide-react";

export default function AdminTablesPage() {
  const [tables, setTables] = useState<GameTable[]>([]);
  const [addTableModal, setAddTableModal] = useState(false);
  const [editTable, setEditTable] = useState<GameTable | null>(null);

  // Form states for table edit
  const [editOpeningTime, setEditOpeningTime] = useState("10:00");
  const [editClosingTime, setEditClosingTime] = useState("01:00");
  const [editHourlyRate, setEditHourlyRate] = useState(350);

  // Form states for new table
  const [tableName, setTableName] = useState("");
  const [tableType, setTableType] = useState<TableType>("pool");

  // Maintenance & Closure Modal
  const [closureModalTable, setClosureModalTable] = useState<GameTable | null>(null);
  const [closureStartDate, setClosureStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [closureStartTime, setClosureStartTime] = useState("10:00");
  const [closureEndDate, setClosureEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [closureEndTime, setClosureEndTime] = useState("18:00");
  const [closureReason, setClosureReason] = useState("");
  const [activeClosures, setActiveClosures] = useState<PoolClosure[]>([]);

  const reload = () => {
    fetch("/api/pools")
      .then((r) => r.json())
      .then((data) => {
        if (data.pools) {
          // Combine pools with any extra tables
          fetch("/api/tables")
            .then((r2) => r2.json())
            .then((d2) => {
              if (d2.tables) setTables(d2.tables);
            })
            .catch(() => setTables(venueStore.getTables()));
        }
      })
      .catch(() => {
        setTables(venueStore.getTables());
      });
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const openEditModal = (table: GameTable) => {
    setEditTable({ ...table });
    setEditOpeningTime(table.opening_time || (table.id === "smoker-pool" ? "11:00" : "10:00"));
    setEditClosingTime(table.closing_time || (table.id === "smoker-pool" ? "02:00" : "01:00"));
    setEditHourlyRate(table.hourly_rate || (table.type === "snooker" ? 500 : table.id === "smoker-pool" ? 400 : 350));
  };

  const openClosureModal = async (table: GameTable) => {
    setClosureModalTable(table);
    setClosureReason("");
    try {
      const res = await fetch(`/api/pools/${table.id}/closures`);
      const data = await res.json();
      if (data.closures) setActiveClosures(data.closures);
    } catch {
      setActiveClosures([]);
    }
  };

  const handleAddClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureModalTable || !closureReason.trim()) return;

    try {
      const startDateTime = new Date(`${closureStartDate}T${closureStartTime}:00`);
      const endDateTime = new Date(`${closureEndDate}T${closureEndTime}:00`);

      const res = await fetch(`/api/pools/${closureModalTable.id}/closures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          reason: closureReason.trim(),
        }),
      });

      if (res.ok) {
        setClosureReason("");
        // Reload closures
        const res2 = await fetch(`/api/pools/${closureModalTable.id}/closures`);
        const data2 = await res2.json();
        if (data2.closures) setActiveClosures(data2.closures);
        reload();
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteClosure = async (closureId: string) => {
    if (!closureModalTable) return;
    try {
      await fetch(`/api/pools/${closureModalTable.id}/closures?closureId=${closureId}`, {
        method: "DELETE",
      });
      const res2 = await fetch(`/api/pools/${closureModalTable.id}/closures`);
      const data2 = await res2.json();
      if (data2.closures) setActiveClosures(data2.closures);
      reload();
    } catch {
      // ignore
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTable) return;

    try {
      // Update via pool patch API
      await fetch(`/api/pools/${editTable.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editTable.name,
          active: editTable.active,
          status: editTable.status,
          opening_time: editOpeningTime,
          closing_time: editClosingTime,
          hourly_rate: editHourlyRate,
        }),
      });

      // Also update table
      await fetch(`/api/tables/${editTable.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editTable.name,
          active: editTable.active,
          status: editTable.status,
          opening_time: editOpeningTime,
          closing_time: editClosingTime,
          hourly_rate: editHourlyRate,
        }),
      });

      setEditTable(null);
      reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <Layers className="w-3.5 h-3.5" />
                CueNation Pool Configuration & Schedules
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Pool Operating Hours, Pricing & Fleet
              </h1>
            </div>

            <Button
              variant="primary-dark"
              size="sm"
              onClick={() => {
                setTableName("");
                setTableType("pool");
                setAddTableModal(true);
              }}
              className="gap-2 font-bold shadow-lamp bg-brass hover:bg-brass-glow text-ink"
            >
              <Plus className="w-4 h-4" />
              <span>Add Playing Table</span>
            </Button>
          </div>

          {/* Tables Fleet Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight/80 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Pool / Table Name</th>
                    <th className="py-3.5 px-4">Discipline</th>
                    <th className="py-3.5 px-4">Operating Hours</th>
                    <th className="py-3.5 px-4">Hourly Rate</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Fleet State</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {tables.map((table) => {
                    const isSnooker = table.type === "snooker";
                    const isMainPool = table.id === "main-pool";
                    const isSmokerPool = table.id === "smoker-pool";
                    const openTime = table.opening_time || (isSmokerPool ? "11:00" : "10:00");
                    const closeTime = table.closing_time || (isSmokerPool ? "02:00" : "01:00");
                    const rate = table.hourly_rate || (isSnooker ? 500 : isSmokerPool ? 400 : 350);

                    return (
                      <tr key={table.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-cream flex items-center gap-2">
                            <span>{table.name}</span>
                            {isMainPool && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                                Primary Showcase
                              </span>
                            )}
                            {isSmokerPool && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                                Primary Showcase
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-mist font-mono">ID: {table.id}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-brass">
                            {isSnooker ? "12ft Tournament Snooker" : isSmokerPool ? "9ft Smoking Lounge Pool" : "9ft Championship Pool"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-cream">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brass" />
                            <span>{openTime} – {closeTime}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-brass">
                          ₹{rate} / hr
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={table.status} isDark />
                        </td>
                        <td className="py-3.5 px-4">
                          {table.active ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                              Active Bookable
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-400">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openClosureModal(table)}
                              className="px-2.5 py-1 rounded-lg bg-midnight border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Wrench className="w-3 h-3" />
                              <span>Closures</span>
                            </button>

                            <button
                              onClick={() => openEditModal(table)}
                              className="px-2.5 py-1 rounded-lg bg-midnight border border-brass/40 hover:border-brass text-cream hover:text-brass text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-brass" />
                              <span>Configure</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit / Configure Modal */}
      <Modal
        isOpen={!!editTable}
        onClose={() => setEditTable(null)}
        title={`Configure ${editTable?.name || "Pool"}`}
      >
        {editTable && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-left text-xs">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                Pool / Table Name
              </label>
              <input
                type="text"
                value={editTable.name}
                onChange={(e) => setEditTable({ ...editTable, name: e.target.value })}
                className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                  Opening Time (Daily)
                </label>
                <input
                  type="time"
                  value={editOpeningTime}
                  onChange={(e) => setEditOpeningTime(e.target.value)}
                  className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                  Closing Time (Daily)
                </label>
                <input
                  type="time"
                  value={editClosingTime}
                  onChange={(e) => setEditClosingTime(e.target.value)}
                  className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                Hourly Booking Rate (₹)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={editHourlyRate}
                onChange={(e) => setEditHourlyRate(Number(e.target.value))}
                className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                  Operational Status
                </label>
                <select
                  value={editTable.status}
                  onChange={(e) =>
                    setEditTable({ ...editTable, status: e.target.value as TableStatus })
                  }
                  className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow cursor-pointer"
                >
                  <option value="free">Free / Ready</option>
                  <option value="running">In Session (Running)</option>
                  <option value="booked">Reserved</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-mist mb-1">
                  Fleet Availability
                </label>
                <select
                  value={editTable.active ? "true" : "false"}
                  onChange={(e) =>
                    setEditTable({ ...editTable, active: e.target.value === "true" })
                  }
                  className="w-full bg-midnight border border-midnight-line rounded-xl p-2.5 text-xs text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow cursor-pointer"
                >
                  <option value="true">Active in Online Booking</option>
                  <option value="false">Disabled / Offline</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditTable(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary-dark" size="sm" className="font-bold bg-brass text-ink hover:bg-brass-glow">
                Save Schedule & Settings
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Schedule Maintenance & Temporary Closure Modal */}
      <Modal
        isOpen={!!closureModalTable}
        onClose={() => setClosureModalTable(null)}
        title={`Maintenance & Temporary Closures — ${closureModalTable?.name}`}
      >
        <div className="space-y-5 text-left text-xs">
          <p className="text-mist">
            Mark specific time intervals as unavailable for maintenance, cloth re-felting, or private VIP buyouts.
            These slots will be greyed out in the customer booking interface.
          </p>

          <form onSubmit={handleAddClosure} className="p-4 rounded-xl bg-midnight border border-midnight-line space-y-3">
            <span className="font-bold text-cream uppercase tracking-wider block text-[11px]">
              Add Closure Window
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-mist mb-1">Start Date & Time</label>
                <div className="flex gap-1">
                  <input
                    type="date"
                    required
                    value={closureStartDate}
                    onChange={(e) => setClosureStartDate(e.target.value)}
                    className="w-full bg-charcoal border border-midnight-line rounded-lg p-2 text-xs text-cream"
                  />
                  <input
                    type="time"
                    required
                    value={closureStartTime}
                    onChange={(e) => setClosureStartTime(e.target.value)}
                    className="w-24 bg-charcoal border border-midnight-line rounded-lg p-2 text-xs text-cream"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-mist mb-1">End Date & Time</label>
                <div className="flex gap-1">
                  <input
                    type="date"
                    required
                    value={closureEndDate}
                    onChange={(e) => setClosureEndDate(e.target.value)}
                    className="w-full bg-charcoal border border-midnight-line rounded-lg p-2 text-xs text-cream"
                  />
                  <input
                    type="time"
                    required
                    value={closureEndTime}
                    onChange={(e) => setClosureEndTime(e.target.value)}
                    className="w-24 bg-charcoal border border-midnight-line rounded-lg p-2 text-xs text-cream"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-mist mb-1">Reason for Closure *</label>
              <input
                type="text"
                required
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                placeholder="e.g. Strachan 6811 cloth replacement / leveling"
                className="w-full bg-charcoal border border-midnight-line rounded-lg p-2 text-xs text-cream"
              />
            </div>

            <Button type="submit" variant="primary-dark" size="sm" className="font-bold w-full bg-amber-500 hover:bg-amber-400 text-ink">
              Apply Maintenance Closure
            </Button>
          </form>

          {/* Active Closures List */}
          <div className="space-y-2">
            <span className="font-bold text-cream uppercase tracking-wider block text-[11px]">
              Active & Upcoming Closures ({activeClosures.length})
            </span>

            {activeClosures.length === 0 ? (
              <p className="text-mist/60 text-xs py-2 italic">No active closures scheduled for this pool.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeClosures.map((c) => {
                  const s = new Date(c.start_datetime);
                  const e = new Date(c.end_datetime);
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-midnight border border-amber-500/20 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-amber-300">{c.reason}</div>
                        <div className="text-[11px] text-mist mt-0.5">
                          {s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {e.toLocaleDateString("en-US", { month: "short", day: "numeric" })} {e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteClosure(c.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 cursor-pointer"
                        title="Remove closure"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
