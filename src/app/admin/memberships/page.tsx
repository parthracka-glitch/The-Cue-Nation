"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { venueStore } from "@/lib/store/venueStore";
import { MembershipPlan, CustomerMembership, RewardLedgerEntry } from "@/types/database";
import {
  Award,
  Crown,
  Search,
  PlusCircle,
  CheckCircle2,
  Gift,
  Coins,
  History,
  AlertCircle,
  RefreshCw,
  Phone,
  User,
  Percent,
} from "lucide-react";
import clsx from "clsx";

export default function AdminMembershipsPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [members, setMembers] = useState<CustomerMembership[]>([]);
  const [ledger, setLedger] = useState<RewardLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Enrollment modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  // Points adjustment modal
  const [adjustMember, setAdjustMember] = useState<CustomerMembership | null>(null);
  const [adjustPoints, setAdjustPoints] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "redeem">("add");

  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setPlans(venueStore.getMembershipPlans());
    setMembers(venueStore.getCustomerMemberships());
    setLedger(venueStore.getRewardLedger());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsub = venueStore.subscribe(loadData);
    return unsub;
  }, []);

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim() || !selectedPlanId) {
      alert("Please enter customer name, phone number, and select a membership plan.");
      return;
    }

    try {
      const newMember = venueStore.enrollMembership({
        customerName: custName.trim(),
        customerPhone: custPhone.trim(),
        planId: selectedPlanId,
      });

      if (newMember) {
        setFeedback(`Enrolled ${newMember.customer_name} into ${newMember.plan_name} plan!`);
      } else {
        setFeedback("Enrollment completed successfully.");
      }
      setIsEnrollModalOpen(false);
      setCustName("");
      setCustPhone("");
      loadData();
    } catch (err) {
      alert("Enrollment failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustMember || adjustPoints <= 0) return;

    try {
      if (adjustType === "add") {
        venueStore.addRewardPoints(
          adjustMember.customer_phone,
          adjustPoints,
          adjustReason.trim() || "Manual staff bonus"
        );
        setFeedback(`Added ${adjustPoints} points to ${adjustMember.customer_name}.`);
      } else {
        venueStore.redeemRewardPoints(
          adjustMember.customer_phone,
          adjustPoints
        );
        setFeedback(`Redeemed ${adjustPoints} points for ${adjustMember.customer_name}.`);
      }
      setAdjustMember(null);
      setAdjustReason("");
      loadData();
    } catch (err) {
      alert("Points adjustment failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.customer_name.toLowerCase().includes(q) ||
      m.customer_phone.includes(q) ||
      m.plan_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-bronze-glow text-xs font-bold uppercase tracking-wider">
              <Crown className="w-4 h-4" />
              <span>Customer Loyalty & VIP Club</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-cream mt-1">
              Membership & Reward Programs
            </h1>
            <p className="text-xs sm:text-sm text-mist">
              Configure tiered membership plans, enroll members, and manage reward point balances.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bronze text-white font-bold text-xs uppercase tracking-wider hover:bg-bronze-glow transition shadow-lg"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enroll New Member</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-mist hover:text-cream transition"
              title="Refresh"
            >
              <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="underline hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Plan Cards Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="p-5 rounded-2xl bg-midnight-card border border-white/10 relative overflow-hidden group hover:border-bronze-glow/50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-bronze/20 text-bronze-glow border border-bronze/30">
                    {plan.duration_days} Days Plan
                  </span>
                  <h3 className="text-lg font-bold text-cream mt-2">{plan.name} Tier</h3>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-bronze-glow">
                  <Award className="w-4 h-4" />
                </div>
              </div>

              <div className="my-4">
                <span className="text-2xl font-mono font-bold text-cream">
                  ₹{plan.fee.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-mist ml-1">/ tenure</span>
              </div>

              <div className="space-y-1.5 text-xs border-t border-white/5 pt-3">
                <div className="flex justify-between text-mist">
                  <span>Discount:</span>
                  <span className="font-bold text-cream">{plan.discount_percentage}% OFF</span>
                </div>
                <div className="flex justify-between text-mist">
                  <span>Points Multiplier:</span>
                  <span className="font-bold text-amber-400">{plan.points_multiplier}x Multiplier</span>
                </div>
                {plan.perks?.slice(0, 2).map((perk, pIdx) => (
                  <div key={pIdx} className="text-mist text-[11px] flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span> {perk}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enrolled Members Table */}
        <div className="bg-midnight-card border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-cream">Active Member Roster</h2>
              <p className="text-xs text-mist">
                {filteredMembers.length} cueists enrolled in loyalty tiers
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-mist absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search member name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-cream text-xs focus:outline-none focus:border-bronze-glow"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight/60 text-mist font-mono uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 font-mono">Points Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-cream">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-mist">
                      No members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4 font-bold text-cream">{m.customer_name}</td>
                      <td className="py-3 px-4 font-mono text-mist">{m.customer_phone}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-bronze/20 text-bronze-glow font-bold text-[10px] uppercase">
                          {m.plan_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-mist">
                        {new Date(m.expiry_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {m.points_balance} pts
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-forest/30 text-emerald-400 font-bold text-[10px] uppercase">
                          {m.active ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setAdjustMember(m)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cream text-[11px] font-semibold transition"
                        >
                          Adjust Points
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loyalty Reward Ledger */}
        <div className="bg-midnight-card border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-cream">Recent Reward Point Ledger</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight/60 text-mist font-mono uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Customer Phone</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Points</th>
                  <th className="py-2.5 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-cream">
                {ledger.slice(0, 10).map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5">
                    <td className="py-2.5 px-4 text-mist font-mono">
                      {new Date(entry.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-mist">{entry.customer_phone}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          entry.type === "earned" && "bg-emerald-500/20 text-emerald-400",
                          entry.type === "redeemed" && "bg-rose-500/20 text-rose-400",
                          entry.type === "adjustment" && "bg-amber-500/20 text-amber-400"
                        )}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold">
                      {entry.points > 0 ? `+${entry.points}` : entry.points}
                    </td>
                    <td className="py-2.5 px-4 text-mist">{entry.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Enrollment Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-card border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-cream">Enroll Customer into Membership</h3>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-mist hover:text-cream text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnroll} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-mist uppercase mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-cream text-sm focus:outline-none focus:border-bronze-glow"
                />
              </div>

              <div>
                <label className="block font-semibold text-mist uppercase mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-cream text-sm focus:outline-none focus:border-bronze-glow"
                />
              </div>

              <div>
                <label className="block font-semibold text-mist uppercase mb-1">
                  Select Membership Tier *
                </label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight border border-white/20 text-cream text-sm focus:outline-none focus:border-bronze-glow"
                >
                  <option value="">-- Choose Tier --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.tier}) — ₹{p.fee} ({p.duration_days} days)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-mist text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-bronze hover:bg-bronze-glow text-white text-xs font-bold uppercase tracking-wider"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Points Modal */}
      {adjustMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-card border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-cream">Adjust Points: {adjustMember.customer_name}</h3>
              <button
                onClick={() => setAdjustMember(null)}
                className="text-mist hover:text-cream text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustPoints} className="space-y-4 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType("add")}
                  className={clsx(
                    "flex-1 py-2 rounded-xl text-xs font-bold uppercase border",
                    adjustType === "add"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-white/5 border-white/10 text-mist"
                  )}
                >
                  + Add Reward Points
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("redeem")}
                  className={clsx(
                    "flex-1 py-2 rounded-xl text-xs font-bold uppercase border",
                    adjustType === "redeem"
                      ? "bg-rose-500/20 border-rose-500 text-rose-400"
                      : "bg-white/5 border-white/10 text-mist"
                  )}
                >
                  - Redeem Points
                </button>
              </div>

              <div>
                <label className="block font-semibold text-mist uppercase mb-1">
                  Point Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-cream text-sm focus:outline-none focus:border-bronze-glow"
                />
              </div>

              <div>
                <label className="block font-semibold text-mist uppercase mb-1">
                  Audit Reason / Order Ref
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP tournament bonus / Session discount"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-cream text-sm focus:outline-none focus:border-bronze-glow"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustMember(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-mist text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-bronze text-white text-xs font-bold uppercase tracking-wider hover:bg-bronze-glow"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
