"use client";

import React, { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, UserCheck, Utensils, CircleDot, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "ADMIN",
      title: "Owner / Admin",
      email: "admin@cueclub.demo",
      password: "Admin@123",
      icon: ShieldCheck,
      color: "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
    },
    {
      role: "STAFF",
      title: "Floor Staff",
      email: "staff@cueclub.demo",
      password: "Staff@123",
      icon: UserCheck,
      color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
    },
    {
      role: "KITCHEN",
      title: "Kitchen Display",
      email: "kitchen@cueclub.demo",
      password: "Kitchen@123",
      icon: Utensils,
      color: "border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20",
    },
    {
      role: "CUSTOMER",
      title: "Customer (Player)",
      email: "player@cueclub.demo",
      password: "Player@123",
      icon: CircleDot,
      color: "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20",
    },
  ];

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res || res.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Fetch active session to read role and perform role-based redirect
      const session = await getSession();
      const userRole = session?.user?.role;

      if (callbackUrl && !callbackUrl.includes("/login")) {
        router.push(callbackUrl);
      } else if (userRole === "ADMIN" || userRole === "STAFF") {
        router.push("/admin");
      } else if (userRole === "KITCHEN") {
        router.push("/kitchen");
      } else {
        router.push("/account");
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred during sign in.");
      setLoading(false);
    }
  }

  function fillCredentials(creds: { email: string; password: string }) {
    setEmail(creds.email);
    setPassword(creds.password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-billiard-950 via-billiard-900 to-black">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-950 border border-emerald-500/30 shadow-lg shadow-emerald-950/50">
            <span className="text-3xl font-black text-emerald-400">🎱</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">CueClub</h1>
          <p className="text-sm text-emerald-300/70">
            Billiards & Snooker Club + Cafe Management Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-emerald-900/40 bg-card/90 backdrop-blur shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials or choose a 1-click demo role below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-950/40 border border-red-800/50 p-3 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@cueclub.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo Credentials Quick-Fill Panel */}
            <div className="pt-4 border-t border-border/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  1-Click Demo Profiles
                </span>
                <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                  Pre-Seeded
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => {
                  const Icon = account.icon;
                  return (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => fillCredentials(account)}
                      className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${account.color}`}
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-bold truncate">{account.title}</span>
                      </div>
                      <span className="text-[10px] opacity-75 font-mono mt-1 truncate w-full">
                        {account.email}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home Link */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
          >
            ← Back to Public Website & Online Booking
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mr-2" />
          <span>Loading CueClub...</span>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
