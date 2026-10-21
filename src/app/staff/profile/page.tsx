"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StaffNav } from "@/components/staff/StaffNav";
import { useAuth } from "@/lib/store/authContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  UserCheck,
  Shield,
  Clock,
  Phone,
  Mail,
  LogOut,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function StaffProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [staffInfo, setStaffInfo] = useState<{
    id: string;
    staff_id?: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cn_staff_user");
      if (stored) {
        setStaffInfo(JSON.parse(stored));
      } else if (user) {
        setStaffInfo({
          id: user.id,
          staff_id: "STF-101",
          name: user.name,
          email: user.email,
          phone: "+91 98765 43210",
          role: user.role,
        });
      }
    } catch {
      // ignore
    }
  }, [user]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("cn_staff_token");
      localStorage.removeItem("cn_staff_user");
    } catch {
      // ignore
    }
    logout();
    router.push("/staff/login");
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-bronze/20 border-2 border-bronze-glow flex items-center justify-center text-bronze-glow mx-auto text-2xl font-black">
              {staffInfo?.name?.charAt(0) || "S"}
            </div>
            <h1 className="font-display text-3xl font-bold text-cream">
              {staffInfo?.name || "Floor Concierge"}
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-baize/20 border border-baize/30 text-xs font-bold text-baize-light uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              Role: {staffInfo?.role || "Staff"} · ID: {staffInfo?.staff_id || "STF-101"}
            </div>
          </div>

          <div className="bg-midnight-card border border-midnight-line rounded-3xl p-8 shadow-xl space-y-6">
            <h3 className="font-display text-xl font-bold text-cream border-b border-midnight-line pb-4">
              Staff Member Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-mist">Assigned Staff ID</span>
                <div className="font-mono font-bold text-cream">{staffInfo?.staff_id || "STF-101"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-mist">Operational Role</span>
                <div className="font-bold text-bronze-glow capitalize">{staffInfo?.role || "Staff"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-mist">Floor Email</span>
                <div className="font-medium text-cream">{staffInfo?.email || "kavya@cuenation.club"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-mist">Mobile Contact</span>
                <div className="font-mono font-medium text-cream">{staffInfo?.phone || "+91 98765 43210"}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-midnight border border-midnight-line space-y-2 text-xs text-mist">
              <div className="font-bold text-cream flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-baize-light" />
                Floor Operational Permissions Active:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Check-in reservations & verify customer PINs</li>
                <li>Start, extend, and terminate playing session timers</li>
                <li>Submit table QR food/drink orders to Kitchen KDS</li>
                <li>Settle combined POS bills with Cash, UPI, or Card</li>
                <li>Report table equipment and baize maintenance tickets</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-midnight-line flex justify-end">
              <Button
                variant="danger"
                size="md"
                onClick={handleLogout}
                className="gap-2 font-bold shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out from Floor Terminal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
