"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Clock, Calendar, CheckCircle, ArrowRight, ShieldAlert, Award, Cigarette } from "lucide-react";
import { PoolBookingModal } from "@/components/booking/PoolBookingModal";

export interface PoolSummary {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image_url: string;
  category: "main" | "smoker";
  opening_time: string;
  closing_time: string;
  hourly_rate: number;
  is_active: boolean;
  status: string;
  isCurrentlyClosed?: boolean;
  nextOpeningTimeLabel?: string;
  scheduleSummary?: {
    totalSlots: number;
    availableCount: number;
    bookedCount: number;
    reservedCount: number;
    unavailableCount: number;
    nextAvailableSlot?: string;
  };
}

export function PoolShowcaseCards() {
  const [pools, setPools] = useState<PoolSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBookingPool, setActiveBookingPool] = useState<PoolSummary | null>(null);

  const fetchPools = async () => {
    try {
      const res = await fetch("/api/pools");
      const data = await res.json();
      if (data.pools) {
        setPools(data.pools);
      }
    } catch (e) {
      console.error("Failed to load pools", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
    const interval = setInterval(fetchPools, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter or guarantee Main Pool and Smoker Pool
  const mainPool = pools.find((p) => p.id === "main-pool" || p.category === "main") || {
    id: "main-pool",
    name: "Main Pool",
    tagline: "Championship Tournament Pool Arena",
    description:
      "Tournament-grade 9ft English Championship Pool arena with authentic Strachan 6811 cloth, laser-leveled 3-piece Brazilian slate, and brass overhead lamp lighting.",
    image_url: "/images/venue-background.jpg",
    category: "main" as const,
    opening_time: "10:00",
    closing_time: "01:00",
    hourly_rate: 350,
    is_active: true,
    status: "free",
    scheduleSummary: {
      totalSlots: 15,
      availableCount: 12,
      bookedCount: 3,
      reservedCount: 0,
      unavailableCount: 0,
      nextAvailableSlot: "12:00 PM",
    },
  };

  const smokerPool = pools.find((p) => p.id === "smoker-pool" || p.category === "smoker") || {
    id: "smoker-pool",
    name: "Smoker Pool",
    tagline: "Private Smoking & Cigar Lounge Pool",
    description:
      "Dedicated climate-controlled smoking & cigar parlour pool arena featuring medical-grade air purification, plush button-tufted Chesterfield leather seating, and table-side cocktail service.",
    image_url:
      "https://images.unsplash.com/photo-1596727147705-61a532a659bd?auto=format&fit=crop&w=1200&q=80",
    category: "smoker" as const,
    opening_time: "11:00",
    closing_time: "02:00",
    hourly_rate: 400,
    is_active: true,
    status: "free",
    scheduleSummary: {
      totalSlots: 15,
      availableCount: 9,
      bookedCount: 5,
      reservedCount: 1,
      unavailableCount: 0,
      nextAvailableSlot: "1:00 PM",
    },
  };

  const poolCards = [
    {
      ...mainPool,
      badge: "Tournament Arena • 9ft",
      icon: Award,
      accentColor: "from-emerald-500/20 to-teal-900/30",
      borderColor: "border-emerald-500/40 hover:border-emerald-400",
      glowColor: "group-hover:shadow-[0_0_35px_rgba(16,185,129,0.25)]",
      features: [
        "Strachan 6811 English Cloth",
        "Laser-Leveled 3-Piece Slate",
        "Overhead Warm Brass Illumination",
        "Aramith Pro-Cup Ball Set",
      ],
    },
    {
      ...smokerPool,
      badge: "Smoking & Cigar Lounge • 9ft",
      icon: Cigarette,
      accentColor: "from-amber-600/20 to-stone-900/40",
      borderColor: "border-amber-500/40 hover:border-amber-400",
      glowColor: "group-hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]",
      features: [
        "Climate & Smoke Air-Purified",
        "Plush Chesterfield Leather Seating",
        "Artisanal Coffee & Drink Service",
        "Private Soundscape & Cigar Bar",
      ],
    },
  ];

  return (
    <section id="pools-showcase" className="relative py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal/80 border border-brass/40 text-xs font-semibold uppercase tracking-widest text-brass backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Your Playing Session</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-ivory tracking-tight">
            Reserve <span className="text-brass">Main Pool</span> or{" "}
            <span className="text-amber-400">Smoker Pool</span>
          </h2>
          <p className="text-sm sm:text-base text-ivory/70 leading-relaxed">
            Check real-time slot availability, operating schedules, and book your session in 60 seconds with instant server confirmation.
          </p>
        </div>

        {/* The Two Prominent Interactive Pool Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {poolCards.map((pool) => {
            const IconComponent = pool.icon;
            const nextSlot = pool.scheduleSummary?.nextAvailableSlot;
            const availableSlotsCount = pool.scheduleSummary?.availableCount ?? 0;
            const isClosed = pool.isCurrentlyClosed;

            return (
              <div
                key={pool.id}
                className={`group relative rounded-3xl overflow-hidden bg-charcoal/90 border transition-all duration-500 flex flex-col justify-between backdrop-blur-xl ${pool.borderColor} ${pool.glowColor}`}
              >
                {/* Visual Image Header */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-midnight">
                  <img
                    src={pool.image_url}
                    alt={pool.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-midnight/80 backdrop-blur-md border border-ivory/20 text-xs font-semibold text-ivory tracking-wide">
                      <IconComponent className="w-3.5 h-3.5 text-brass" />
                      <span>{pool.badge}</span>
                    </span>

                    {/* Live Status Pill */}
                    {isClosed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-xs font-semibold text-red-200 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span>Currently Closed</span>
                      </span>
                    ) : availableSlotsCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>Available Now</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-xs font-semibold text-amber-200 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <span>Fully Booked Today</span>
                      </span>
                    )}
                  </div>

                  {/* Bottom Header Overlay */}
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-ivory">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-display font-bold text-ivory group-hover:text-brass transition-colors">
                        {pool.name}
                      </h3>
                      <p className="text-xs text-ivory/70 mt-0.5">{pool.tagline}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-ivory/60 font-semibold block">
                        Hourly Rate
                      </span>
                      <span className="text-2xl font-bold font-display text-brass tabular-nums">
                        ₹{pool.hourly_rate}
                        <span className="text-xs font-normal text-ivory/60">/hr</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                  {/* Description & Operating Hours */}
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed font-sans">
                      {pool.description}
                    </p>

                    {/* Schedule & Availability Bar */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-midnight-card/80 border border-ivory/10 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brass flex-shrink-0" />
                        <div>
                          <span className="text-[11px] text-ivory/60 block">Daily Hours</span>
                          <span className="font-medium text-ivory">
                            {pool.opening_time} – {pool.closing_time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <span className="text-[11px] text-ivory/60 block">Next Available</span>
                          <span className="font-semibold text-emerald-300">
                            {isClosed
                              ? pool.nextOpeningTimeLabel || `Opens at ${pool.opening_time}`
                              : nextSlot
                              ? `Today at ${nextSlot}`
                              : "No slots left today"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {pool.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-ivory/75">
                          <CheckCircle className="w-3.5 h-3.5 text-brass flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => setActiveBookingPool(pool)}
                      className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-brass to-brass-dark hover:from-brass-glow hover:to-brass text-ink font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-brass/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveBookingPool(pool)}
                      className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-midnight-card hover:bg-charcoal border border-ivory/20 hover:border-brass/40 text-ivory text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Availability</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dedicated Interactive Booking Modal for the Selected Pool */}
      {activeBookingPool && (
        <PoolBookingModal
          pool={activeBookingPool}
          isOpen={!!activeBookingPool}
          onClose={() => {
            setActiveBookingPool(null);
            fetchPools();
          }}
        />
      )}
    </section>
  );
}
