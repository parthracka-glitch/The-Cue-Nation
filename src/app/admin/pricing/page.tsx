"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Pricing } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Percent,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
} from "lucide-react";

export default function AdminPricingPage() {
  const [pricingRules, setPricingRules] = useState<Pricing[]>([]);
  const [poolRate, setPoolRate] = useState(350);
  const [snookerRate, setSnookerRate] = useState(500);
  const [taxPercentage, setTaxPercentage] = useState(5);
  const [editRule, setEditRule] = useState<Pricing | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const reload = () => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.pricing) setPricingRules(data.pricing);
        if (data.baseRates) {
          setPoolRate(data.baseRates.pool_hourly_rate);
          setSnookerRate(data.baseRates.snooker_hourly_rate);
          setTaxPercentage(data.baseRates.tax_percentage);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    reload();
  }, []);

  const handleSaveBaseRates = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin",
        },
        body: JSON.stringify({
          pool_hourly_rate: poolRate,
          snooker_hourly_rate: snookerRate,
          tax_percentage: taxPercentage,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        reload();
      }
    } catch {
      // ignore
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRule) return;

    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin",
        },
        body: JSON.stringify({
          id: editRule.id,
          updates: {
            label: editRule.label,
            price_per_hour: Number(editRule.price_per_hour),
            start_time: editRule.start_time,
            end_time: editRule.end_time,
          },
        }),
      });

      if (res.ok) {
        setEditRule(null);
        reload();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <Percent className="w-3.5 h-3.5" />
                Revenue Architecture & Tariff Configuration
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Pricing Rules & Hourly Rates
              </h1>
            </div>

            {saveSuccess && (
              <span className="text-xs font-bold text-baize-light flex items-center gap-1.5 bg-baize/20 px-3 py-1.5 rounded-full border border-baize/30">
                <CheckCircle2 className="w-4 h-4" /> Rates successfully updated
              </span>
            )}
          </div>

          {/* Base Rates Form */}
          <div className="bg-midnight-card border border-midnight-line rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
            <h3 className="font-display text-xl font-bold text-cream">
              Global Base Hourly Rates & Taxes
            </h3>
            <p className="text-xs text-mist">
              Changes apply strictly to new reservations. Confirmed bookings preserve their locked rate.
            </p>

            <form onSubmit={handleSaveBaseRates} className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1.5">
                  Pool Base Rate (₹ / hr)
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={poolRate}
                  onChange={(e) => setPoolRate(Number(e.target.value))}
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 font-mono text-lg font-bold text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1.5">
                  Snooker Base Rate (₹ / hr)
                </label>
                <input
                  type="number"
                  required
                  min={200}
                  value={snookerRate}
                  onChange={(e) => setSnookerRate(Number(e.target.value))}
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 font-mono text-lg font-bold text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1.5">
                  Service / GST Tax (%)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={30}
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 font-mono text-lg font-bold text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <Button variant="primary-dark" size="md" type="submit" className="gap-2 font-bold bg-bronze hover:bg-bronze-dark text-white">
                  <Save className="w-4 h-4" />
                  Save Base Tariff Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Time-Based Rules Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg space-y-4 p-6">
            <h3 className="font-display text-xl font-bold text-cream">
              Time-of-Day & Weekend Rate Multipliers
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3 px-4">Discipline</th>
                    <th className="py-3 px-4">Rule Label</th>
                    <th className="py-3 px-4">Time Window</th>
                    <th className="py-3 px-4">Rate (₹ / hr)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {pricingRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold uppercase tracking-wider text-bronze-glow">
                        {rule.table_type}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-cream">
                        {rule.label}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-mist">
                        {rule.start_time} — {rule.end_time}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-baize-light text-sm">
                        ₹{rule.price_per_hour}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditRule({ ...rule })}
                          className="text-xs text-mist hover:text-cream gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Modify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Rule Modal */}
      <Modal
        isOpen={!!editRule}
        onClose={() => setEditRule(null)}
        title="Modify Pricing Tier"
      >
        {editRule && (
          <form onSubmit={handleSaveRule} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Tier Label:
              </label>
              <input
                type="text"
                required
                value={editRule.label}
                onChange={(e) => setEditRule({ ...editRule, label: e.target.value })}
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Hourly Price (₹ / hr):
              </label>
              <input
                type="number"
                required
                min={100}
                value={editRule.price_per_hour}
                onChange={(e) => setEditRule({ ...editRule, price_per_hour: Number(e.target.value) })}
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono font-bold focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                  Start Time:
                </label>
                <input
                  type="text"
                  required
                  value={editRule.start_time}
                  onChange={(e) => setEditRule({ ...editRule, start_time: e.target.value })}
                  placeholder="10:00"
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                  End Time:
                </label>
                <input
                  type="text"
                  required
                  value={editRule.end_time}
                  onChange={(e) => setEditRule({ ...editRule, end_time: e.target.value })}
                  placeholder="17:00"
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" size="sm" type="button" onClick={() => setEditRule(null)}>
                Cancel
              </Button>
              <Button variant="primary-dark" size="sm" type="submit" className="font-bold bg-bronze hover:bg-bronze-dark text-white">
                Save Rule
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
