"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { MaintenanceRecord } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default function AdminMaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [resolveTarget, setResolveTarget] = useState<MaintenanceRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const reload = () => {
    fetch("/api/maintenance")
      .then((r) => r.json())
      .then((data) => {
        if (data.records) setRecords(data.records);
      })
      .catch(() => {});
  };

  useEffect(() => {
    reload();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget) return;
    setIsResolving(true);

    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: resolveTarget.id,
          notes: resolutionNotes.trim() || "Inspected and certified tournament ready by Admin",
          restoreTableToFree: true,
        }),
      });

      if (res.ok) {
        setResolveTarget(null);
        setResolutionNotes("");
        reload();
      }
    } catch {
      // ignore
    } finally {
      setIsResolving(false);
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
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <Wrench className="w-3.5 h-3.5" />
                Equipment Health & Table Restoration
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Table Maintenance Master Log
              </h1>
            </div>

            <div className="text-xs text-mist font-semibold">
              Total Logged Incidents: <strong className="text-cream">{records.length}</strong>
            </div>
          </div>

          {/* Maintenance Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Table</th>
                    <th className="py-3.5 px-4">Reported Issue</th>
                    <th className="py-3.5 px-4">Severity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Reported By / Date</th>
                    <th className="py-3.5 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-mist">
                        No maintenance tickets logged. All tables in tournament caliber condition.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-cream">
                          {r.table_name}
                        </td>
                        <td className="py-3.5 px-4 max-w-sm">
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
                              Active Issue
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
                                setResolveTarget(r);
                                setResolutionNotes("");
                              }}
                              className="text-xs font-bold"
                            >
                              Certify & Resolve
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

      {/* Resolve Modal */}
      <Modal
        isOpen={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        title="Certify Equipment Repair"
      >
        {resolveTarget && (
          <form onSubmit={handleResolve} className="space-y-4 text-left">
            <div className="p-3 bg-midnight-card border border-midnight-line rounded-xl text-xs space-y-1">
              <div>Table: <strong className="text-cream">{resolveTarget.table_name}</strong></div>
              <div>Issue: <span className="text-mist">{resolveTarget.issue}</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Technician / Certification Notes:
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Details of repair, cloth brushing, iron temperature, or cushion tightening..."
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" size="sm" type="button" onClick={() => setResolveTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary-dark" size="sm" type="submit" disabled={isResolving} className="font-bold bg-bronze hover:bg-bronze-dark text-white">
                {isResolving ? "Certifying..." : "Mark Resolved & Restore Table"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
