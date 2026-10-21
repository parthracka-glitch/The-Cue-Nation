"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { BilliardsHero } from "@/components/billiards/BilliardsHero";
import { GameFlashcardsBookingSection } from "@/components/booking/GameFlashcardsBookingSection";
import { venueStore } from "@/lib/store/venueStore";
import { MenuItem } from "@/types/database";
import {
  Sparkles,
  Coffee,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Calendar,
} from "lucide-react";

export default function HomePage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    setMenu(venueStore.getMenu());
    const unsub = venueStore.subscribe(() => {
      setMenu(venueStore.getMenu());
    });
    return unsub;
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* 1. MASTER BILLIARDS HERO SECTION */}
      <BilliardsHero />

      {/* 2. TWO MASTER FLASHCARDS (POOL & SNOOKER) WITH 3-TABLE SYNCHRONIZED BOOKING & PIN GENERATION */}
      <GameFlashcardsBookingSection />

      {/* 3. ARTISANAL CAFÉ & QR ORDERING */}
      <section id="cafe" className="py-20 bg-midnight text-cream relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-midnight-card border border-midnight-line text-xs font-semibold text-bronze-glow">
                <Coffee className="w-3.5 h-3.5" />
                <span>IN-HOUSE SPECIALTY ROASTERY</span>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-bold text-cream leading-tight">
                Serious Coffee for <br />
                <span className="text-bronze-glow italic">Focused Shots.</span>
              </h2>

              <p className="text-mist leading-relaxed text-sm sm:text-base">
                Our in-house café fuels your session with single-origin pour overs, cold brews, and gourmet club snacks. Scan the brass QR token on your table rail to order without pausing your break. Served orders roll directly into your single combined bill.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Table-side QR ordering with zero app download required",
                  "Signature cold brew steeped for 18 hours in French glass",
                  "Artisanal sourdough melt sandwiches and truffle parmesan fries",
                  "One auto-calculated bill uniting table time and kitchen orders",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-cream/90">
                    <CheckCircle2 className="w-4 h-4 text-baize-light flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href="/t/table-3.demo/menu">
                  <Button variant="primary-dark" size="md" className="gap-2">
                    <Sparkles className="w-4 h-4 text-midnight" />
                    Preview Table QR Menu
                  </Button>
                </Link>
              </div>
            </div>

            {/* Menu items teaser carousel */}
            <div className="grid grid-cols-2 gap-4">
              {menu.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="bg-midnight-card rounded-2xl border border-midnight-line overflow-hidden p-3 space-y-2 hover:border-bronze-glow/40 transition-colors"
                >
                  <div className="h-28 w-full rounded-xl overflow-hidden bg-midnight">
                    <img
                      src={item.image_url || ""}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-bronze-glow font-bold">
                      {item.category}
                    </div>
                    <div className="font-semibold text-sm text-cream truncate">
                      {item.name}
                    </div>
                    <div className="font-display text-sm text-bronze-glow font-bold tabular-nums">
                      ₹{item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE PARLOUR PHILOSOPHY & ABOUT */}
      <section id="about" className="py-20 bg-cream text-midnight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-bronze">
              The Philosophy
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Where Precision Meets Leisure
            </h2>
            <p className="text-ash text-sm sm:text-base leading-relaxed">
              Cue Nation was established to strip away the noise of modern gaming lounges. We offer a lamp-lit sanctuary with authentic cues, perfect baize, and uncompromising respect for the game.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="light" className="p-7 space-y-4 border border-black/10">
              <div className="w-12 h-12 rounded-xl bg-baize/10 flex items-center justify-center text-baize">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold">Zero Double-Booking</h3>
              <p className="text-xs text-ash leading-relaxed">
                Guaranteed by database exclusion constraints. The second a slot is taken, it is locked for everyone else in under 1 second.
              </p>
            </Card>

            <Card variant="light" className="p-7 space-y-4 border border-black/10">
              <div className="w-12 h-12 rounded-xl bg-bronze/10 flex items-center justify-center text-bronze">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold">PIN Check-in</h3>
              <p className="text-xs text-ash leading-relaxed">
                Book online, receive a confidential 6-digit PIN. Arrive at the parlour desk, show your PIN, and your session clock starts immediately.
              </p>
            </Card>

            <Card variant="light" className="p-7 space-y-4 border border-black/10">
              <div className="w-12 h-12 rounded-xl bg-baize/10 flex items-center justify-center text-baize">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold">Unified Hospitality</h3>
              <p className="text-xs text-ash leading-relaxed">
                No awkward split tabs between table rates and kitchen tickets. One clean thermal receipt with Cash, UPI, or Card support.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="bg-baize text-cream py-16 felt-texture border-t border-baize-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-cream">
            Ready for your next rack?
          </h2>
          <p className="text-cream/90 text-sm sm:text-base max-w-xl mx-auto">
            Reserve your preferred table now. Live floor availability updates automatically without refreshing.
          </p>
          <div className="pt-2">
            <Link href="/book">
              <Button variant="primary-dark" size="lg" className="shadow-lamp gap-2">
                <Calendar className="w-5 h-5 text-midnight" />
                Book Your Table in 60 Seconds
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
