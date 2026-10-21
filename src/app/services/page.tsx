"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Trophy,
  Users,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      id: "coaching",
      icon: Award,
      title: "Master Cueist 1-on-1 Coaching",
      subtitle: "Personalized coaching by certified state-ranked players",
      description:
        "Master stance geometry, cue action alignment, bridge stability, break-building strategy, and safety play. Video analysis included for rapid stroke perfection.",
      pricing: "₹1,200 / 60-min session",
      features: [
        "High-speed 120fps video swing analysis",
        "Laser-guided aiming and cue stroke assessment",
        "Cue ball spin control, screw, and stun mechanics",
        "Personalized practice drill curriculum",
      ],
      badge: "Popular",
    },
    {
      id: "corporate",
      icon: Users,
      title: "Corporate Tournaments & Private Hire",
      subtitle: "Full venue or private arena buyout for teams",
      description:
        "Host memorable corporate team tournaments, client entertainment, or birthday leagues. Includes dedicated referee, bracket management, and full café catering.",
      pricing: "Starting at ₹15,000 / 4-hour block",
      features: [
        "Exclusive access to Main Pool & Snooker Arenas",
        "Live tournament bracket scoring display",
        "Specialty roastery coffee & gourmet catering packages",
        "Trophies and custom medals available on request",
      ],
      badge: "Corporate",
    },
    {
      id: "membership",
      icon: Trophy,
      title: "CueNation Club Patron Membership",
      subtitle: "Priority booking, table discounts, and private league entry",
      description:
        "An exclusive membership tier for dedicated cueists. Enjoy 20% table discounts, guaranteed reservation hold, locker storage for personal 2-piece cues, and monthly club tournaments.",
      pricing: "₹4,500 / quarter",
      features: [
        "20% off all table hours across peak and standard times",
        "Dedicated climate-controlled personal cue locker",
        "Direct access to invitation-only monthly ranking leagues",
        "Complimentary artisanal cold brew with every 2-hour session",
      ],
      badge: "Exclusive",
    },
    {
      id: "maintenance",
      icon: Sparkles,
      title: "Cue Tip Replacement & Shaft Care",
      subtitle: "Professional cue servicing and leather tip installation",
      description:
        "Keep your cue performing with crisp response. We install premium layered tips (Kamui, Taom, Elk Master), re-ferrule shafts, and polish wood to silky smooth touch.",
      pricing: "₹350 – ₹900 per tip",
      features: [
        "Lathe-machined precision tip fitting and crowning",
        "Silky shaft burnishing with micro-abrasive wax",
        "Brass ferrule alignment and thread inspection",
        "Same-day turnaround for standard tips",
      ],
      badge: "Workshop",
    },
  ];

  return (
    <div className="min-h-screen bg-midnight text-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-baize/20 border border-baize/30 text-xs font-semibold text-baize-light uppercase tracking-widest">
            <Star className="w-3.5 h-3.5" />
            Bespoke Billiards & Hospitality Services
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-cream">
            Elevate Your Game
          </h1>
          <p className="text-ash text-sm sm:text-base leading-relaxed">
            From technical coaching with state champions to private arena tournaments and club memberships,
            CueNation provides end-to-end services for true cue sports enthusiasts.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.id}
                variant="dark"
                className="p-6 sm:p-8 flex flex-col justify-between border-midnight-line hover:border-bronze/50 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-bronze/10 border border-bronze/20 flex items-center justify-center text-bronze">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="bg-baize/20 text-baize-light border border-baize/30 text-xs font-bold px-2.5 py-1 rounded-full">
                      {s.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-bold text-cream">
                      {s.title}
                    </h3>
                    <p className="text-xs font-semibold text-bronze mt-1">
                      {s.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-ash mt-3 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm font-bold text-cream mb-2">Service Highlights:</div>
                    <ul className="space-y-2">
                      {s.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-ash">
                          <CheckCircle2 className="w-4 h-4 text-baize-light shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-midnight-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-ash block">Fee Structure</span>
                    <span className="text-base font-bold text-bronze-glow">{s.pricing}</span>
                  </div>
                  <Link href="/contact" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto text-xs">
                      Inquire with Concierge
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-2xl bg-midnight-card border border-midnight-line space-y-4">
          <h3 className="font-display text-2xl font-bold text-cream">
            Ready to Play Tonight?
          </h3>
          <p className="text-ash text-xs sm:text-sm max-w-lg mx-auto">
            Book an English Match Pool table or Full-size Snooker arena instantly with live slot verification and 6-digit confidential PIN access.
          </p>
          <div className="pt-2">
            <Link href="/book">
              <Button variant="primary" className="px-8">
                Reserve a Table
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
