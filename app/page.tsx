import React from "react";
import Link from "next/link";
import prisma from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveFloorSync } from "@/components/home/live-floor-sync";
import { TableShowcase } from "@/components/home/table-showcase";
import { PricingCalculator } from "@/components/home/pricing-calculator";
import { CafeShowcase } from "@/components/home/cafe-showcase";
import { ReviewsAndFaq } from "@/components/home/reviews-and-faq";
import {
  Calendar,
  Zap,
  Sparkles,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Star,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch packages and memberships
  const packages = await prisma.packageDeal.findMany({ where: { active: true } });
  const membershipPlans = await prisma.membershipPlan.findMany({ where: { active: true } });

  // Fetch initial floor status snapshot
  const tables = await prisma.gameTable.findMany({
    include: {
      rateCard: { include: { bands: true } },
      sessions: {
        where: { status: { in: ["RUNNING", "PAUSED"] } },
        take: 1,
      },
      reservations: {
        where: {
          status: { in: ["CONFIRMED", "PENDING"] },
          endsAt: { gte: new Date() },
        },
        orderBy: { startsAt: "asc" },
        take: 1,
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const counts: Record<string, { total: number; available: number; occupied: number; reserved: number }> = {
    POOL: { total: 0, available: 0, occupied: 0, reserved: 0 },
    SNOOKER: { total: 0, available: 0, occupied: 0, reserved: 0 },
    CAROM: { total: 0, available: 0, occupied: 0, reserved: 0 },
  };

  let totalAll = 0;
  let availableAll = 0;
  let occupiedAll = 0;

  const now = new Date();

  const formattedTables = tables.map((t) => {
    const activeSession = t.sessions[0];
    const nextReservation = t.reservations[0];

    let effectiveStatus = t.status as "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
    if (activeSession) {
      effectiveStatus = "OCCUPIED";
    } else if (nextReservation && new Date(nextReservation.startsAt) <= now) {
      effectiveStatus = "RESERVED";
    }

    if (counts[t.type]) {
      counts[t.type].total++;
      if (effectiveStatus === "AVAILABLE") counts[t.type].available++;
      else if (effectiveStatus === "OCCUPIED") counts[t.type].occupied++;
      else if (effectiveStatus === "RESERVED") counts[t.type].reserved++;
    }

    totalAll++;
    if (effectiveStatus === "AVAILABLE") availableAll++;
    if (effectiveStatus === "OCCUPIED") occupiedAll++;

    const primaryBand = t.rateCard.bands[0];
    const ratePerHourPaise = primaryBand ? primaryBand.ratePerHourPaise : 30000;

    let elapsedMinutes = 0;
    if (activeSession) {
      elapsedMinutes = Math.max(0, Math.floor((now.getTime() - new Date(activeSession.startedAt).getTime()) / 60000));
    }

    return {
      id: t.id,
      name: t.name,
      type: t.type as "POOL" | "SNOOKER" | "CAROM",
      status: effectiveStatus,
      rateCardName: t.rateCard.name,
      ratePerHourPaise,
      hasActiveSession: !!activeSession,
      elapsedMinutes,
      framesPlayed: activeSession?.framesPlayed || 0,
      hasUpcomingReservation: !!nextReservation,
      reservationStart: nextReservation ? nextReservation.startsAt.toISOString() : null,
    };
  });

  const initialFloorData = {
    timestamp: now.toISOString(),
    summary: {
      totalTables: totalAll,
      availableTables: availableAll,
      occupiedTables: occupiedAll,
      occupancyRate: totalAll > 0 ? Math.round((occupiedAll / totalAll) * 100) : 0,
      byType: counts,
    },
    tables: formattedTables,
  };

  return (
    <div className="min-h-screen flex flex-col bg-billiard-950 text-foreground selection:bg-emerald-500 selection:text-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Luxury Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-32 border-b border-border bg-gradient-to-b from-billiard-900 via-billiard-950 to-billiard-950">
          {/* Ambient Lighting Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-8">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/70 text-emerald-300 text-xs font-semibold backdrop-blur shadow-lg shadow-emerald-950/50">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cyber Hub's Premier Billiards & Snooker Lounge</span>
              <span className="text-amber-400 font-bold ml-1 flex items-center">
                ★ 4.9 (1,200+ Reviews)
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
                Where Precision Meets{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-300 bg-clip-text text-transparent">
                  Lounge Luxury.
                </span>
              </h1>

              <p className="text-base sm:text-xl text-emerald-100/75 max-w-3xl mx-auto leading-relaxed font-normal">
                Play on championship 9ft Simonis slate & heated 12ft Snooker tables. Enjoy artisanal cafe bites ordered to your cue, with transparent minute-by-minute pricing and real-time floor synchronization.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/book">
                <Button size="lg" variant="gold" className="text-base px-8 h-13 font-bold shadow-2xl shadow-amber-950/60 gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Table Online (Instant Confirm)
                </Button>
              </Link>
              <Link href="/book/lookup">
                <Button size="lg" variant="outline" className="text-base px-6 h-13 border-emerald-700/50 hover:border-emerald-500 hover:bg-emerald-950/40">
                  Find Existing Booking
                </Button>
              </Link>
            </div>

            {/* Value Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6">
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 backdrop-blur flex items-center justify-center gap-2 text-xs text-emerald-300 font-medium">
                <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Simonis 860 Cloth</span>
              </div>
              <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-950/20 backdrop-blur flex items-center justify-center gap-2 text-xs text-amber-300 font-medium">
                <Flame className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Heated Slate Beds</span>
              </div>
              <div className="p-3 rounded-xl border border-sky-500/20 bg-sky-950/20 backdrop-blur flex items-center justify-center gap-2 text-xs text-sky-300 font-medium">
                <Zap className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Minute-Level Billing</span>
              </div>
              <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-950/20 backdrop-blur flex items-center justify-center gap-2 text-xs text-purple-300 font-medium">
                <Trophy className="h-4 w-4 text-purple-400 shrink-0" />
                <span>Overhead 4K Replays</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Synchronized Floor Status Section */}
        <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <LiveFloorSync initialData={initialFloorData} />
        </section>

        {/* Equipment & Table Showcase */}
        <TableShowcase />

        {/* Interactive Dynamic Rate & Savings Calculator */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
          <PricingCalculator />
        </section>

        {/* Value Packages & VIP Memberships */}
        <section className="py-20 bg-gradient-to-b from-billiard-900/40 via-billiard-950 to-billiard-900/40 border-t border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <Badge variant="outline" className="text-amber-400 border-amber-500/40 px-3 py-1 text-xs">
                <Trophy className="h-3.5 w-3.5 mr-1" /> Elite Club Memberships
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Prepaid Packages & VIP Tiers
              </h2>
              <p className="text-sm text-muted-foreground">
                Save up to 30% with prepaid hour packs, or join our monthly VIP membership for priority weekend reservations and exclusive discounts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="border-border/80 bg-card/70 hover:border-emerald-600/50 transition-all flex flex-col justify-between shadow-xl"
                >
                  <CardHeader>
                    <Badge variant="outline" className="w-fit text-[10px] text-emerald-400 border-emerald-500/30">
                      Prepaid Pack
                    </Badge>
                    <CardTitle className="text-xl mt-2 text-white">{pkg.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {pkg.quantity} {pkg.billingMode === "TIME" ? "Hours" : "Frames"} Included for {pkg.tableType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-extrabold text-amber-400">
                      {formatINR(pkg.pricePaise)}
                    </div>
                    <ul className="text-xs space-y-1.5 text-muted-foreground border-t border-border/40 pt-3">
                      <li className="flex items-center gap-1.5 text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        Valid for 60 days
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        Transferable with friends
                      </li>
                    </ul>
                    <Link href={`/book?type=${pkg.tableType}`} className="w-full block pt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        Book Using Pack
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {membershipPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="border-amber-500/40 bg-gradient-to-b from-card/90 to-amber-950/20 hover:border-amber-400 transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-[10px] font-bold text-stone-950 uppercase rounded-bl-lg">
                    VIP Pass
                  </div>
                  <CardHeader>
                    <Badge variant="gold" className="w-fit text-[10px]">
                      Monthly Tier
                    </Badge>
                    <CardTitle className="text-xl mt-2 text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {plan.discountPercent}% OFF Table Rates + {plan.includedMinutes > 0 ? `${plan.includedMinutes / 60}h Free Monthly` : "Priority Table Hold"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-extrabold text-emerald-400">
                      {formatINR(plan.priceInPaise)}
                      <span className="text-xs text-muted-foreground font-normal"> / month</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-muted-foreground border-t border-border/40 pt-3">
                      <li className="flex items-center gap-1.5 text-amber-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        {plan.discountPercent}% flat discount on all games
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        Dedicated personal cue locker
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        10% discount on Cafe dining
                      </li>
                    </ul>
                    <Link href="/book" className="w-full block pt-2">
                      <Button size="sm" variant="gold" className="w-full text-xs font-bold shadow-lg shadow-amber-950/40">
                        Join Membership
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cafe & Gourmet Dining Showcase */}
        <CafeShowcase />

        {/* Customer Reviews & Interactive FAQ */}
        <ReviewsAndFaq />

        {/* Bottom Call to Action Banner */}
        <section className="py-16 md:py-24 border-t border-border bg-gradient-to-r from-billiard-900 via-billiard-950 to-emerald-950/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready for the Ultimate Cue Experience?
            </h2>
            <p className="text-sm sm:text-base text-emerald-200/80 max-w-2xl mx-auto">
              Choose your table, select your play window, and lock in your session in under 60 seconds with instant WhatsApp and SMS confirmation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/book">
                <Button size="lg" variant="gold" className="font-bold text-base px-9 h-13 shadow-2xl shadow-amber-950/60">
                  <Calendar className="mr-2 h-5 w-5" /> Reserve Your Table Now
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base px-6 h-13">
                  Staff & Member Portal
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
