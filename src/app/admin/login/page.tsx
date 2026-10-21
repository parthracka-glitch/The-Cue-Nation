"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/store/authContext";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function AdminLoginPage() {
  const router = useRouter();
  const { switchRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "admin",
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Administrator authentication failed");
        setIsLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("cn_admin_token", data.token);
        localStorage.setItem("cn_admin_user", JSON.stringify(data.user));
      }
      switchRole("owner");
      router.push("/admin/dashboard");
    } catch {
      setError("Network or server connection error");
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@cuenation.club");
    setPassword("AdminPassword123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-bronze/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-baize/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Back Navigation */}
      <div className="w-full max-w-md mx-auto mb-4 relative z-20">
        <BackButton fallbackHref="/" label="Back to Public Site" variant="dark" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <Logo theme="dark" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bronze/20 border border-bronze/30 text-[11px] font-bold text-bronze-glow uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Master Business Administration
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream tracking-tight">
          Administrator Sign In
        </h2>
        <p className="text-mist text-xs sm:text-sm">
          Access business-wide financial metrics, staff accounts, pricing controls, and audit trails.
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

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cuenation.club"
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 text-sm text-cream placeholder-mist/40 focus:outline-none focus:ring-2 focus:ring-bronze focus:border-transparent transition-all"
                />
                <ShieldCheck className="w-4 h-4 text-mist absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full bg-midnight border border-midnight-line rounded-xl px-4 py-2.5 text-sm text-cream placeholder-mist/40 focus:outline-none focus:ring-2 focus:ring-bronze focus:border-transparent transition-all"
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
              className="w-full shadow-lamp gap-2 mt-2 font-bold bg-bronze hover:bg-bronze-dark text-white"
            >
              {isLoading ? (
                <span>Authenticating Administrator...</span>
              ) : (
                <>
                  <span>Sign In to Executive Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="pt-4 border-t border-midnight-line text-center space-y-2">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-xs text-bronze-glow hover:underline font-semibold"
            >
              Quick Test: Fill Demo Admin Credentials
            </button>
            <div className="text-[11px] text-mist">
              Email: <code className="text-cream">admin@cuenation.club</code> · Password: <code className="text-cream">AdminPassword123!</code>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-mist">
          Staff member?{" "}
          <Link href="/staff/login" className="text-bronze-glow hover:underline font-semibold">
            Sign in to Staff Floor Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
