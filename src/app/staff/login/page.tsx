"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/store/authContext";
import {
  KeyRound,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function StaffLoginPage() {
  const router = useRouter();
  const { switchRole } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "staff",
          identifier,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      // Store token and switch authContext role
      if (typeof window !== "undefined") {
        localStorage.setItem("cn_staff_token", data.token);
        localStorage.setItem("cn_staff_user", JSON.stringify(data.user));
      }
      switchRole("staff");
      router.push("/staff/dashboard");
    } catch {
      setError("Network or server connection error");
      setIsLoading(false);
    }
  };

  const fillDemoStaff = () => {
    setIdentifier("STF-101");
    setPassword("StaffPassword123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/3 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-baize/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-bronze-glow/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Back Navigation */}
      <div className="w-full max-w-md mx-auto mb-4 relative z-20">
        <BackButton fallbackHref="/" label="Back to Public Site" variant="dark" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <Logo theme="dark" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-baize/20 border border-baize/30 text-[11px] font-bold text-baize-light uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          Floor Concierge & Operations Portal
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream tracking-tight">
          Staff Member Sign In
        </h2>
        <p className="text-mist text-xs sm:text-sm">
          Access daily reservations, table allocations, playing session timers, and POS billing.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-midnight-card py-8 px-6 sm:px-10 rounded-3xl border border-midnight-line shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-cue-light/10 border border-cue-light/30 flex items-start gap-2.5 text-xs text-cue-light">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1.5">
                Staff ID or Work Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. STF-101 or kavya@cuenation.club"
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 text-sm text-cream placeholder-mist/40 focus:outline-none focus:ring-2 focus:ring-bronze-glow focus:border-transparent transition-all"
                />
                <UserCheck className="w-4 h-4 text-mist absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your assigned password"
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 text-sm text-cream placeholder-mist/40 focus:outline-none focus:ring-2 focus:ring-bronze-glow focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-mist hover:text-cream"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary-dark"
              size="lg"
              disabled={isLoading}
              className="w-full shadow-lamp gap-2 mt-2 font-bold"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Floor Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="pt-4 border-t border-midnight-line text-center space-y-2">
            <button
              type="button"
              onClick={fillDemoStaff}
              className="text-xs text-bronze-glow hover:underline font-semibold"
            >
              Quick Test: Fill Demo Staff Credentials (STF-101)
            </button>
            <div className="text-[11px] text-mist">
              Default password: <code className="text-cream">StaffPassword123!</code>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-mist">
          Administrator?{" "}
          <Link href="/admin/login" className="text-bronze-glow hover:underline font-semibold">
            Sign in to Main Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
