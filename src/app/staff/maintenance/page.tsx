"use client";

import React, { useState, useEffect } from "react";
import { StaffNav } from "@/components/staff/StaffNav";
import { backendDataStore } from "@/lib/services/dataStore";
import { MaintenanceRecord, GameTable } from "@/types/database";
import { venueStore } from "@/lib/store/venueStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Clock,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

export default function StaffMaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [reportModal, setReportModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  // Form states
  const [selectedTableId, setSelectedTableId] = useState("");
  const [issue, setIssue] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [markOffline, setMarkOffline] = useState(true);
  const [resolveNotes, setResolveNotes] = useState("");

  const reload = () => {
    fetch("/api/maintenance")
      .then((r) => r.json())
      .then((data) => {
        if (data.records) setRecords(data.records);
      })
      .catch(() => {});
    setTables(venueStore.getTables());
  };

  useEffect(() => {
    reload();
    if (tables.length > 0 && !selectedTableId) {
      setSelectedTableId(tables[0]!.id);
    }
  }, [tables.length]);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId || !issue.trim()) return;

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTableId,
          issue: issue.trim(),
          severity,
          markTableOffline: markOffline,
        }),
      });

      if (res.ok) {
        setReportModal(false);
        setIssue("");
        reload();
      }
    } catch {
      // ignore
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: selectedRecord.id,
          notes: resolveNotes.trim() || "Maintenance resolved by floor staff",
          restoreTableToFree: true,
        }),
      });

      if (res.ok) {
        setResolveModal(false);
        setSelectedRecord(null);
        setResolveNotes("");
        reload();
      }
    } catch {
      // ignore
    }
  };

  const getSeverityBadge = (sev: MaintenanceRecord["severity"]) => {
    switch (sev) {
      case "critical":
        return "bg-cue-light/20 text-cue-light border-cue-light/30";
      case "high":
        return "bg-amber/20 text-amber border-amber/30";
      case "medium":
        return "bg-bronze-glow/20 text-bronze-glow border-bronze-glow/30";
      default:
        return "bg-mist/10 text-mist border-mist/20";
    }
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
                <Wrench className="w-3.5 h-3.5" />
                Equipment & Cloth Health
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Table Maintenance & Diagnostics
              </h1>
            </div>

            <Button
              variant="primary-dark"
              size="sm"
              onClick={() => setReportModal(true)}
              className="gap-2 font-bold shadow-lamp"
            >
              <Plus className="w-4 h-4 text-midnight" />
              Report Maintenance Issue
            </Button>
          </div>

          {/* Records Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Table</th>
                    <th className="py-3.5 px-4">Issue Description</th>
                    <th className="py-3.5 px-4">Severity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Reported Info</th>
                    <th className="py-3.5 px-4 text-right">Floor Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-mist">
                        No maintenance tickets on file. All tables operating at tournament caliber.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-cream">
                          {r.table_name}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-cream">{r.issue}</div>
                          {r.notes && (
                            <div className="text-[11px] text-baize-light mt-0.5">
                              Resolution: {r.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadge(
                              r.severity
                            )}`}
                          >
                            {r.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {r.status === "resolved" ? (
                            <span className="text-baize-light font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Resolved
                            </span>
                          ) : (
                            <span className="text-amber font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Active Ticket
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-mist">
                          <div>{r.reported_by}</div>
                          <div className="text-[10px] text-mist/70">
                            {new Date(r.reported_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {r.status !== "resolved" && (
                            <Button
                              variant="secondary-dark"
                              size="sm"
                              onClick={() => {
                                setSelectedRecord(r);
                                setResolveModal(true);
                              }}
                              className="text-xs font-bold"
                            >
                              Resolve Ticket
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={reportModal}
        onClose={() => setReportModal(false)}
        title="Report Table Maintenance"
      >
        <form onSubmit={handleReport} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
              Select Table:
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
              Issue Diagnosis:
            </label>
            <textarea
              required
              rows={3}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. Cloth scratch on spot, pocket leather frayed, slate drift..."
              className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream placeholder-mist/40 focus:outline-none focus:ring-1 focus:ring-bronze-glow"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
              Severity:
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
            >
              <option value="low">Low — Cosmetic / Non-urgent</option>
              <option value="medium">Medium — Cushion / Chalking issue</option>
              <option value="high">High — Ball roll deflection</option>
              <option value="critical">Critical — Immediate lock required</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="markOffline"
              checked={markOffline}
              onChange={(e) => setMarkOffline(e.target.checked)}
              className="rounded bg-midnight border-midnight-line text-bronze-glow focus:ring-bronze-glow"
            />
            <label htmlFor="markOffline" className="text-xs text-cream font-medium cursor-pointer">
              Mark table status as &quot;Maintenance&quot; immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setReportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary-dark" size="sm" type="submit" className="font-bold">
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModal}
        onClose={() => setResolveModal(false)}
        title="Resolve Maintenance Ticket"
      >
        {selectedRecord && (
          <form onSubmit={handleResolve} className="space-y-4 text-left">
            <div className="p-3 bg-midnight-card border border-midnight-line rounded-xl text-xs space-y-1">
              <div>Table: <strong className="text-cream">{selectedRecord.table_name}</strong></div>
              <div>Issue: <span className="text-mist">{selectedRecord.issue}</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Resolution Notes:
              </label>
              <textarea
                required
                rows={3}
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Describe actions taken (e.g. Ironed cloth, replaced pocket net, leveled slate)..."
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream placeholder-mist/40 focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" size="sm" type="button" onClick={() => setResolveModal(false)}>
                Cancel
              </Button>
              <Button variant="primary-dark" size="sm" type="submit" className="font-bold">
                Mark Resolved & Set Table Free
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
