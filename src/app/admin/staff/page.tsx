"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { StaffAccount } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  UserCog,
  Plus,
  Shield,
  KeyRound,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [createModal, setCreateModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);
  const [targetStaff, setTargetStaff] = useState<StaffAccount | null>(null);

  // Create form states
  const [staffId, setStaffId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"staff" | "manager">("staff");
  const [initialPassword, setInitialPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    fetch("/api/staff", {
      headers: { Authorization: "Bearer admin" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.staff) setStaffList(data.staff);
      })
      .catch(() => {});
  };

  useEffect(() => {
    reload();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin",
        },
        body: JSON.stringify({
          staff_id: staffId,
          name,
          email,
          phone,
          role,
          initialPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create staff account");
        return;
      }

      setCreateModal(false);
      setStaffId("");
      setName("");
      setEmail("");
      setPhone("");
      setInitialPassword("");
      reload();
    } catch {
      setError("Network error while creating account");
    }
  };

  const handleToggleActive = async (staff: StaffAccount) => {
    try {
      const res = await fetch(`/api/staff/${staff.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin",
        },
        body: JSON.stringify({
          action: "toggle_active",
          active: !staff.active,
        }),
      });

      if (res.ok) {
        reload();
      }
    } catch {
      // ignore
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStaff || !newPassword) return;

    try {
      const res = await fetch(`/api/staff/${targetStaff.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin",
        },
        body: JSON.stringify({
          action: "reset_password",
          newPassword,
        }),
      });

      if (res.ok) {
        setResetModal(false);
        setTargetStaff(null);
        setNewPassword("");
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <UserCog className="w-3.5 h-3.5" />
                Floor Operations Staff Identity
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Staff Account Management
              </h1>
            </div>

            <Button
              variant="primary-dark"
              size="sm"
              onClick={() => {
                setError(null);
                setStaffId(`STF-${Math.floor(100 + Math.random() * 900)}`);
                setInitialPassword("StaffTemp123!");
                setCreateModal(true);
              }}
              className="gap-2 font-bold shadow-lamp bg-bronze hover:bg-bronze-dark text-white"
            >
              <Plus className="w-4 h-4" />
              Provision New Staff Member
            </Button>
          </div>

          {/* Staff Accounts Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Staff ID</th>
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Mobile</th>
                    <th className="py-3.5 px-4">Floor Role</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Security Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {staffList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-14 px-4 text-mist">
                        <div className="max-w-xs mx-auto space-y-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-mist">
                            <UserCog className="w-5 h-5 text-bronze-glow" />
                          </div>
                          <div>
                            <div className="font-semibold text-cream text-sm">No Staff Accounts</div>
                            <p className="text-xs text-mist mt-0.5">
                              No operational staff accounts configured yet.
                            </p>
                          </div>
                          <Button
                            variant="primary-dark"
                            size="sm"
                            onClick={() => setCreateModal(true)}
                            className="bg-bronze hover:bg-bronze-glow text-midnight font-bold gap-1 text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" /> Provision First Account
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    staffList.map((st) => (
                      <tr key={st.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-bronze-glow">
                          {st.staff_id}
                        </td>
                      <td className="py-3.5 px-4 font-bold text-cream">
                        {st.name}
                      </td>
                      <td className="py-3.5 px-4 text-mist font-mono">
                        {st.email}
                      </td>
                      <td className="py-3.5 px-4 text-mist font-mono">
                        {st.phone || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-cream">
                          {st.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {st.active ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-baize/20 text-baize-light border border-baize/30">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cue-light/20 text-cue-light border border-cue-light/30">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTargetStaff(st);
                            setNewPassword("NewPass123!");
                            setResetModal(true);
                          }}
                          className="text-xs text-mist hover:text-cream border-midnight-line"
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Reset Password
                        </Button>

                        <Button
                          variant={st.active ? "danger" : "secondary-dark"}
                          size="sm"
                          onClick={() => handleToggleActive(st)}
                          className="text-xs font-bold"
                        >
                          {st.active ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Provision Staff Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Provision Staff Floor Account"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4 text-left">
          {error && (
            <div className="p-3 rounded-xl bg-cue-light/10 border border-cue-light/30 text-xs text-cue-light flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Staff ID:
              </label>
              <input
                type="text"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="STF-103"
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Role:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              >
                <option value="staff">Staff Concierge</option>
                <option value="manager">Floor Manager</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
              Full Legal Name:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arun Nair"
              className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Email:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arun@cuenation.club"
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                Mobile:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
              Initial Temporary Password:
            </label>
            <input
              type="text"
              required
              value={initialPassword}
              onChange={(e) => setInitialPassword(e.target.value)}
              className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
            />
            <div className="text-[11px] text-mist mt-1">
              Provide these initial credentials securely to the staff member.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary-dark" size="sm" type="submit" className="font-bold bg-bronze hover:bg-bronze-dark text-white">
              Create & Issue Credentials
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModal}
        onClose={() => setResetModal(false)}
        title="Reset Staff Password"
      >
        {targetStaff && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-left">
            <p className="text-xs text-mist leading-relaxed">
              Generate a replacement password for staff member <strong className="text-cream">{targetStaff.name}</strong> ({targetStaff.staff_id}).
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                New Temporary Password:
              </label>
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="ghost" size="sm" type="button" onClick={() => setResetModal(false)}>
                Cancel
              </Button>
              <Button variant="primary-dark" size="sm" type="submit" className="font-bold bg-bronze hover:bg-bronze-dark text-white">
                Update Password
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
