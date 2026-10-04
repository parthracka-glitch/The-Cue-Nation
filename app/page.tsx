import React from "react";
import Link from "next/link";
import prisma from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch live table availability count by type
  const tables = await prisma.gameTable.findMany({
    select: { type: true, status: true },
  });

  const availableCounts: Record<string, number> = {
    POOL: 0,
    SNOOKER: 0,
    CAROM: 0,
  };
  const totalCounts: Record<string, number> = {
    POOL: 0,
    SNOOKER: 0,
    CAROM: 0,
  };

  tables.forEach((t) => {
    if (totalCounts[t.type] !== undefined) {
      totalCounts[t.type]++;
      if (t.status === "AVAILABLE") {
        availableCounts[t.type]++;
      }
    }
  });

  // Fetch Rate Cards & Rate Bands to show Happy Hour and Peak rates
  const rateCards = await prisma.rateCard.findMany({
    include: { bands: true },
  });
  const poolRateCard = rateCards.find((r) => r.name.includes("Pool")) || rateCards[0];
  const snookerRateCard = rateCards.find((r) => r.name.includes("Snooker")) || rateCards[1];

  // Fetch Packages and Memberships
  const packages = await prisma.packageDeal.findMany({ where: { active: true } });
  const membershipPlans = await prisma.membershipPlan.findMany({ where: { active: true } });

  // Menu Highlights (sample 4 items)
  const menuHighlights = await prisma.menuItem.findMany({
    take: 4,
    include: { category: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-billiard-950 text-foreground selection:bg-emerald-500 selection:text-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 border-b border-border bg-gradient-to-b from-billiard-900/60 via-billiard-950 to-billiard-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 text-emerald-300 text-xs font-medium backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Tournament-Grade Billiards & Snooker Lounge
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Where Precision Meets{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-300 bg-clip-text text-transparent">
                Lounge Luxury.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-emerald-100/70 max-w-2xl mx-auto leading-relaxed">
              Play on premium English felt tables, order artisanal cafe bites to your cue, and enjoy transparent minute-by-minute pricing with happy hour discounts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/book">
                <Button size="lg" variant="gold" className="text-base px-8 h-12 shadow-xl shadow-amber-950/40">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book a Table Online
                </Button>
              </Link>
              <Link href="/book/lookup">
                <Button size="lg" variant="outline" className="text-base px-6 h-12">
                  Find Existing Booking
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Venue Availability Banner */}
        <section className="py-8 bg-billiard-900/40 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Live Floor Availability
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Current table readiness updated in real-time
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card/60 min-w-[100px]">
                  <span className="text-2xl font-bold text-emerald-400">
                    {availableCounts.POOL} / {totalCounts.POOL}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Pool Tables
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card/60 min-w-[100px]">
                  <span className="text-2xl font-bold text-amber-400">
                    {availableCounts.SNOOKER} / {totalCounts.SNOOKER}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Snooker Tables
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card/60 min-w-[100px]">
                  <span className="text-2xl font-bold text-sky-400">
                    {availableCounts.CAROM} / {totalCounts.CAROM}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Carom Boards
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Pricing Bands & Happy Hour Showcase */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-amber-400 border-amber-500/40">
              Transparent Dynamic Rates
            </Badge>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Pay Only For The Minutes You Play
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Our automated billing engine splits session intervals across rate bands minute by minute. No rounding up to full hours!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pool Rate Card */}
            <Card className="border-emerald-800/40 bg-card/70 overflow-hidden relative">
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-l from-emerald-600 to-emerald-800 text-[11px] font-bold text-white uppercase rounded-bl-lg">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-2xl text-white">Pool Tables (8-Ball & 9-Ball)</CardTitle>
                <CardDescription>International 9ft slate tables with Simonis cloth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {poolRateCard?.bands.map((band) => {
                    const isHappyHour = band.label.toLowerCase().includes("happy");
                    return (
                      <div
                        key={band.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isHappyHour
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                            : "border-border bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isHappyHour && <Zap className="h-4 w-4 text-amber-400 shrink-0" />}
                          <div>
                            <span className="text-sm font-semibold text-white block">
                              {band.label}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {Math.floor(band.startMinute / 60)}:00 – {Math.floor(band.endMinute / 60)}:00
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-emerald-400">
                            {formatINR(band.ratePerHourPaise)}
                          </span>
                          <span className="text-xs text-muted-foreground block">/ hour</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Snooker Rate Card */}
            <Card className="border-border bg-card/70 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Snooker Tables (12ft Tournament)</CardTitle>
                <CardDescription>Championship Strachan 6811 cloth & heating beds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {snookerRateCard?.bands.map((band) => (
                    <div
                      key={band.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30"
                    >
                      <div>
                        <span className="text-sm font-semibold text-white block">
                          {band.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {Math.floor(band.startMinute / 60)}:00 – {Math.floor(band.endMinute / 60)}:00
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-amber-400">
                          {formatINR(band.ratePerHourPaise)}
                        </span>
                        <span className="text-xs text-muted-foreground block">/ hour</span>
                      </div>
                    </div>
                  ))}
                  {snookerRateCard?.framePricePaise && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30">
                      <div>
                        <span className="text-sm font-semibold text-white block">
                          Per Frame Billing
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          For competitive singles or doubles matches
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-sky-400">
                          {formatINR(snookerRateCard.framePricePaise)}
                        </span>
                        <span className="text-xs text-muted-foreground block">/ frame</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Packages & Memberships */}
        <section className="py-16 bg-billiard-900/30 border-t border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">Value Packages & Memberships</h2>
              <p className="text-sm text-muted-foreground">
                Save up to 30% with prepaid hour packages and VIP monthly tiers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="border-border bg-card/80 flex flex-col justify-between">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit text-[10px] text-emerald-400">
                      Prepaid Pack
                    </Badge>
                    <CardTitle className="text-lg mt-2 text-white">{pkg.name}</CardTitle>
                    <CardDescription>
                      {pkg.quantity} {pkg.billingMode === "TIME" ? "Hours" : "Frames"} Included
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-amber-400">
                      {formatINR(pkg.pricePaise)}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {membershipPlans.map((plan) => (
                <Card key={plan.id} className="border-amber-500/30 bg-card/80 flex flex-col justify-between">
                  <CardHeader>
                    <Badge variant="gold" className="w-fit text-[10px]">
                      Monthly VIP
                    </Badge>
                    <CardTitle className="text-lg mt-2 text-white">{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.discountPercent}% OFF Table Rates + {plan.includedMinutes > 0 ? `${plan.includedMinutes / 60}h Free` : "Exclusive booking"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatINR(plan.priceInPaise)}
                      <span className="text-xs text-muted-foreground font-normal"> / 30 days</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cafe F&B Highlights */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge variant="outline" className="text-emerald-400 mb-2">
                CueClub Kitchen & Bar
              </Badge>
              <h2 className="text-3xl font-bold text-white">Gourmet Cafe Dining</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Order directly from your table card. Kitchen order tickets are routed instantly to the kitchen display.
              </p>
            </div>
            <Link href="/book">
              <Button variant="outline" size="sm">
                Reserve & Dine
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuHighlights.map((item) => (
              <Card key={item.id} className="border-border bg-card/60 hover:border-emerald-700/50 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="text-4xl">{item.imageEmoji || "🍔"}</div>
                  <div>
                    <span className="text-xs text-muted-foreground block">{item.category.name}</span>
                    <h4 className="text-base font-semibold text-white">{item.name}</h4>
                  </div>
                  <div className="text-base font-bold text-emerald-400">
                    {formatINR(item.pricePaise)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
