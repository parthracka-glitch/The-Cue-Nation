"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  ShieldCheck,
  CreditCard,
  Percent,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function PricingPage() {
  const rates = [
    {
      type: "Match Pool (9ft)",
      subtitle: "Brunswick Gold Crown & Rasson Ox",
      standardRate: "₹300",
      primeRate: "₹350",
      weekendRate: "₹400",
      features: [
        "Strachan 6811 tournament cloth",
        "Super Aramith Pro-Cup 2¼\" ball set",
        "Individual overhead brass lighting canopy",
        "Premium house cues (18oz & 19oz)",
        "Complimentary chalk & bridge sticks",
      ],
      popular: false,
    },
    {
      type: "Championship Snooker (12ft)",
      subtitle: "Riley Aristocrat & Star Tournament Arena",
      standardRate: "₹500",
      primeRate: "₹550",
      weekendRate: "₹600",
      features: [
        "Heated 5-piece Italian slate bed",
        "Steel-block tournament cushions",
        "Aramith Tournament Champion 1G balls",
        "Precision brass spider, swan-neck & extended rests",
        "Pre-brushed and ironed before every frame",
      ],
      popular: true,
    },
  ];

  const packages = [
    {
      title: "Cueist Break — 2 Hours",
      price: "₹650",
      tableType: "Pool",
      includes: "2 Hours continuous Match Pool + 2 Artisanal Cold Brews",
    },
    {
      title: "Snooker Century Pass — 3 Hours",
      price: "₹1,450",
      tableType: "Snooker",
      includes: "3 Hours Tournament Snooker + Artisan Espresso & Truffle Fries",
    },
    {
      title: "Midnight Racks — 4 Hours",
      price: "₹1,800",
      tableType: "Pool or Snooker",
      includes: "Late night 4-hour lock-in (10 PM - 2 AM) + Roastery platter",
    },
  ];

  return (
    <div className="min-h-screen bg-cream-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Navigation */}
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="light" />
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bronze/10 text-bronze font-semibold text-xs tracking-wider uppercase">
            <Percent className="w-3.5 h-3.5" />
            Transparent Rates & Hourly Billing
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-midnight tracking-tight">
            Hourly Rates & Curated Packages
          </h1>
          <p className="text-ash text-base sm:text-lg leading-relaxed">
            All prices include table prep, cloth maintenance, balls, cue racks, and lighting. No surprise maintenance
            surcharges or hidden fees.
          </p>
        </div>

        {/* Rate Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {rates.map((rate, idx) => (
            <Card
              key={idx}
              className={`p-8 rounded-3xl flex flex-col justify-between transition-all relative overflow-hidden bg-white ${
                rate.popular
                  ? "ring-2 ring-bronze shadow-card-hover border-bronze/40"
                  : "border-black/10 shadow-card"
              }`}
            >
              {rate.popular && (
                <div className="absolute top-0 right-0 bg-bronze text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                  Tournament Favorite
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-midnight">
                    {rate.type}
                  </h3>
                  <p className="text-sm text-ash mt-1">{rate.subtitle}</p>
                </div>

                {/* Pricing Tiers */}
                <div className="space-y-3 bg-cream-soft/60 p-4 rounded-xl border border-bronze/10 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-ash">Weekday Daytime (10 AM - 5 PM)</span>
                    <span className="font-mono font-bold text-midnight">{rate.standardRate} / hr</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-t border-black/5 pt-2">
                    <span className="text-ash">Weekday Prime (5 PM - 1 AM)</span>
                    <span className="font-mono font-bold text-midnight">{rate.primeRate} / hr</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-t border-black/5 pt-2">
                    <span className="text-ash">Weekends & Holidays</span>
                    <span className="font-mono font-bold text-baize">{rate.weekendRate} / hr</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs uppercase font-bold text-ash tracking-wider">
                    Included with Every Booking:
                  </div>
                  {rate.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 text-sm text-ash">
                      <CheckCircle2 className="w-4 h-4 text-baize shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-black/5">
                <Link href="/booking">
                  <Button
                    variant={rate.popular ? "primary" : "secondary"}
                    size="lg"
                    className="w-full gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Reserve {rate.type.split(" ")[0]} Table
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Packages Section */}
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl font-bold text-midnight">
              Player Packages & Lounge Deals
            </h2>
            <p className="text-ash text-sm">
              Combine championship table time with our in-house specialty coffee roastery and kitchen menu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, pIdx) => (
              <div
                key={pIdx}
                className="bg-white border border-black/10 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-bronze">
                    {pkg.tableType}
                  </span>
                  <h4 className="font-display text-xl font-bold text-midnight">
                    {pkg.title}
                  </h4>
                  <p className="text-sm text-ash leading-relaxed">
                    {pkg.includes}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-black/5 flex items-center justify-between">
                  <div className="font-mono text-2xl font-bold text-midnight">
                    {pkg.price}
                  </div>
                  <Link href="/booking">
                    <Button variant="outline" size="sm">
                      Select Package
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Cancellation Policies */}
        <div className="bg-white border border-black/10 rounded-3xl p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-midnight">
              <CreditCard className="w-5 h-5 text-bronze" />
              Payment Methods
            </div>
            <p className="text-sm text-ash leading-relaxed">
              Pay online via UPI, Credit/Debit cards, or choose Pay at Venue upon arrival.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-midnight">
              <Clock className="w-5 h-5 text-baize" />
              Easy Rescheduling
            </div>
            <p className="text-sm text-ash leading-relaxed">
              Reschedule for free up to 2 hours before your reserved slot directly from your booking link.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-midnight">
              <ShieldCheck className="w-5 h-5 text-bronze" />
              Anti-Double-Booking
            </div>
            <p className="text-sm text-ash leading-relaxed">
              100% server-locked availability. We never overbook or auction slots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
