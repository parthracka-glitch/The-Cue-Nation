"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { AuditLog } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Clock,
  UserCheck,
  Terminal,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const reload = () => {
    fetch("/api/audit-logs", {
      headers: { Authorization: "Bearer admin" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(() => {});
  };

  useEffect(() => {
    reload();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const actionMatch = l.action.toLowerCase().includes(q);
    const actorMatch = l.actor_name.toLowerCase().includes(q);
    const resourceMatch = l.resource_type.toLowerCase().includes(q);
    return actionMatch || actorMatch || resourceMatch;
  });

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <ShieldCheck className="w-3.5 h-3.5" />
                Security, Compliance & Privilege Monitoring
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Immutable Business Audit Logs
              </h1>
            </div>

            <div className="text-xs text-mist font-semibold">
              Total Audited Operations: <strong className="text-cream">{filteredLogs.length}</strong>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-midnight-card p-4 rounded-2xl border border-midnight-line shadow-md max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit action, actor name, or resource..."
                className="w-full bg-midnight border border-midnight-line rounded-xl pl-9 pr-4 py-2 text-xs text-cream placeholder-mist/40 focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
              <Search className="w-4 h-4 text-mist absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp (UTC)</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Privileged Action</th>
                    <th className="py-3.5 px-4">Resource</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-mist">
                        No audit events match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-mist">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-cream">{log.actor_name}</div>
                          <div className="text-[10px] text-bronze-glow uppercase tracking-wider">
                            {log.actor_role} ({log.actor_id})
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-baize-light">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-mist uppercase text-[11px]">
                          {log.resource_type}: <span className="text-cream">{log.resource_id}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="text-xs text-mist hover:text-cream gap-1"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            Inspect
                          </Button>
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

      {/* Inspect Log Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Details"
      >
        {selectedLog && (
          <div className="space-y-4 text-left">
            <div className="p-3 bg-midnight-card border border-midnight-line rounded-xl text-xs space-y-1">
              <div>Action: <strong className="text-baize-light font-mono">{selectedLog.action}</strong></div>
              <div>Actor: <span className="text-cream">{selectedLog.actor_name} ({selectedLog.actor_role})</span></div>
              <div>Timestamp: <span className="font-mono text-mist">{selectedLog.timestamp}</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Event Payload & Changes:
              </label>
              <pre className="bg-midnight border border-midnight-line rounded-xl p-3 text-[11px] font-mono text-cream overflow-x-auto max-h-52">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
