"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { BackButton } from "@/components/ui/BackButton";
import {
  Crown,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Zap,
  ArrowRight,
  Calculator,
  Lock,
  Trophy,
  Coffee,
  Calendar,
  Gift,
  HelpCircle,
} from "lucide-react";
import clsx from "clsx";
import confetti from "canvas-confetti";

interface MembershipTier {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number; // per month billed annually
  highlight?: boolean;
  colorScheme: "dark" | "gold" | "emerald";
  features: string[];
  perks: { icon: any; text: string }[];
}

const TIERS: MembershipTier[] = [
  {
    id: "casual",
    name: "Cueist Social",
    tagline: "Pay-as-you-play access for casual social players and weekend hangouts.",
    monthlyPrice: 0,
    annualPrice: 0,
    colorScheme: "dark",
    features: [
      "Standard table booking up to 24h in advance",
      "Pay standard hourly tariffs at checkout",
      "Full digital café QR ordering to table tab",
      "Digital scorekeeping on your smartphone",
      "Complimentary chalk & standard house cues",
    ],
    perks: [
      { icon: Clock, text: "Standard 24h booking window" },
      { icon: Coffee, text: "Full café & roastery access" },
    ],
  },
  {
    id: "gold",
    name: "Gold Baize Club",
    badge: "Most Popular",
    tagline: "For regular enthusiasts seeking off-peak practice, discounts, and priority slots.",
    monthlyPrice: 1499,
    annualPrice: 1199,
    highlight: true,
    colorScheme: "gold",
    features: [
      "20% discount on off-peak hours (Mon–Fri, 10 AM – 5 PM)",
      "48-hour priority advance booking window",
      "1 complimentary artisanal cold brew or espresso per booking",
      "10% discount on all food & beverage orders",
      "Invitation to bi-weekly Sunday Amateur Ranking Shootouts",
      "Free 30-min session extension once per month (subject to slot availability)",
      "Dedicated member profile with match history & statistics",
    ],
    perks: [
      { icon: Zap, text: "20% off off-peak table rates" },
      { icon: Clock, text: "48h priority slot reservations" },
      { icon: Coffee, text: "Free cold brew every booking" },
      { icon: Trophy, text: "Bi-weekly amateur league entry" },
    ],
  },
  {
    id: "black-velvet",
    name: "Black Velvet VIP",
    badge: "Master Tier",
    tagline: "The definitive cue club experience. Unlimited practice, personal locker, and tournament waivers.",
    monthlyPrice: 3999,
    annualPrice: 3199,
    colorScheme: "emerald",
    features: [
      "Unlimited weekday solo practice (Mon–Fri, 10 AM – 3 PM, subject to fair play)",
      "Dedicated climate-controlled cue locker with custom engraved brass nameplate",
      "Zero reservation deposit required across all peak & prime slots",
      "7-day advance booking priority on Championship 12ft Snooker Arena",
      "Free entry waivers to all quarterly Cue Nation Open Championships",
      "20% discount across entire artisanal roastery & kitchen menu",
      "1 quarterly 60-min swing & stance video analysis with our resident pro",
      "VIP concierge lane for instant table allocation on walk-ins",
    ],
    perks: [
      { icon: Crown, text: "Unlimited weekday solo practice" },
      { icon: Lock, text: "Personal climate-controlled cue locker" },
      { icon: Trophy, text: "Free tournament entry waivers" },
      { icon: Sparkles, text: "Quarterly video coaching session" },
    ],
  },
];

export default function MembershipsPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  // Form state
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPhone, setMemberPhone] = useState("");

  // Interactive ROI Calculator State
  const [weeklyHours, setWeeklyHours] = useState<number>(4);
  const [prefersGame, setPrefersGame] = useState<"pool" | "snooker">("pool");

  // Calculation for savings
  const hourlyRate = prefersGame === "pool" ? 350 : 550;
  const standardMonthlyCost = weeklyHours * 4 * hourlyRate;
  // With Gold (20% off table + 4 free drinks worth ~₹720 + 10% cafe savings)
  const goldSavings = Math.round(standardMonthlyCost * 0.2 + 720);
  const goldNetCost = standardMonthlyCost - goldSavings + (billingCycle === "annual" ? 1199 : 1499);
  const netSavings = standardMonthlyCost - goldNetCost;

  const handleOpenJoin = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setJoinedSuccess(false);
    setModalOpen(true);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setJoinedSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#03120F] text-white selection:bg-[#E9B94F] selection:text-[#0A1917] pb-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(circle_at_top,rgba(233,185,79,0.12)_0%,rgba(10,46,29,0.08)_50%,transparent_80%)] blur-3xl opacity-80" />
        <div className="absolute top-[600px] -left-48 w-96 h-96 bg-[#0B3B24]/20 rounded-full blur-3xl" />
        <div className="absolute top-[900px] -right-48 w-96 h-96 bg-[#E9B94F]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
        {/* Navigation Breadcrumb */}
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="dark" />
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E9B94F]/10 border border-[#E9B94F]/30 text-[#E9B94F] font-semibold text-xs tracking-widest uppercase">
            <Crown className="w-4 h-4" />
            Cue Nation Patron Club & Memberships
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Unlock the Table. <br />
            <span className="text-[#E9B94F] bg-gradient-to-r from-[#E9B94F] via-[#F6D78D] to-[#E9B94F] bg-clip-text text-transparent">
              Elevate Every Frame.
            </span>
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
            From casual enthusiasts to tournament-grade cueists, Cue Nation memberships grant you guaranteed priority
            booking, substantial off-peak discounts, private cue storage lockers, and complimentary roastery brews.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <span
              className={clsx(
                "text-sm font-medium transition-colors cursor-pointer",
                billingCycle === "monthly" ? "text-white font-semibold" : "text-neutral-400"
              )}
              onClick={() => setBillingCycle("monthly")}
            >
              Billed Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative w-14 h-8 rounded-full bg-[#1A2E28] border border-[#E9B94F]/30 p-1 transition-colors cursor-pointer focus:outline-none"
              aria-label="Toggle annual billing"
            >
              <div
                className={clsx(
                  "w-6 h-6 rounded-full bg-[#E9B94F] transition-transform duration-200 shadow-md",
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
            <span
              className={clsx(
                "text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer",
                billingCycle === "annual" ? "text-white font-semibold" : "text-neutral-400"
              )}
              onClick={() => setBillingCycle("annual")}
            >
              Billed Annually
              <span className="px-2 py-0.5 rounded-full bg-[#E9B94F]/20 text-[#E9B94F] border border-[#E9B94F]/40 text-xs font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          {TIERS.map((tier) => {
            const isGold = tier.id === "gold";
            const isBlack = tier.id === "black-velvet";
            const price = billingCycle === "annual" ? tier.annualPrice : tier.monthlyPrice;

            return (
              <div
                key={tier.id}
                className={clsx(
                  "relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300",
                  isGold
                    ? "bg-gradient-to-b from-[#0F2922] to-[#041611] border-2 border-[#E9B94F] shadow-[0_0_40px_rgba(233,185,79,0.15)] -translate-y-2 lg:-translate-y-3"
                    : isBlack
                    ? "bg-gradient-to-b from-[#0B211A] to-[#03100D] border border-[#2A4A3E] hover:border-[#E9B94F]/50 shadow-xl"
                    : "bg-[#061814]/80 border border-[#172D26] hover:border-[#2A4A3E]"
                )}
              >
                {/* Floating Ribbon */}
                {tier.badge && (
                  <div
                    className={clsx(
                      "absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md",
                      isGold
                        ? "bg-[#E9B94F] text-[#0A1917]"
                        : "bg-[#0D3B2E] text-[#6EE7B7] border border-[#34D399]/40"
                    )}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Title & Tagline */}
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                      {tier.name}
                      {isGold && <Crown className="w-5 h-5 text-[#E9B94F]" />}
                    </h3>
                    <p className="text-neutral-400 text-sm mt-2 leading-relaxed min-h-[40px]">
                      {tier.tagline}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-mono font-bold text-white">
                        {price === 0 ? "Free" : `₹${price.toLocaleString()}`}
                      </span>
                      {price > 0 && (
                        <span className="text-neutral-400 text-xs sm:text-sm">
                          / month
                        </span>
                      )}
                    </div>
                    {price > 0 && (
                      <p className="text-[11px] text-neutral-400">
                        {billingCycle === "annual"
                          ? `₹${(price * 12).toLocaleString()} billed upfront yearly`
                          : "Billed monthly, cancel anytime"}
                      </p>
                    )}
                  </div>

                  {/* Key Perks Pills */}
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    {tier.perks.map((perk, pIdx) => {
                      const Icon = perk.icon;
                      return (
                        <div
                          key={pIdx}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-neutral-200"
                        >
                          <Icon className="w-4 h-4 text-[#E9B94F] shrink-0" />
                          <span>{perk.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                      Tier Inclusions:
                    </div>
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                        <CheckCircle2 className="w-4 h-4 text-[#E9B94F] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action Button */}
                <div className="pt-8 mt-6 border-t border-white/10">
                  <button
                    onClick={() => handleOpenJoin(tier)}
                    className={clsx(
                      "w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98",
                      isGold
                        ? "bg-[#E9B94F] hover:bg-[#F6D78D] text-[#0A1917] shadow-[#E9B94F]/20"
                        : isBlack
                        ? "bg-gradient-to-r from-[#0D3B2E] to-[#125542] hover:from-[#114b3b] hover:to-[#176a52] text-white border border-[#34D399]/30"
                        : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                    )}
                  >
                    <span>{price === 0 ? "Get Started Free" : `Join ${tier.name}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Membership ROI Calculator */}
        <div className="bg-gradient-to-r from-[#071E18] via-[#0B2A22] to-[#071E18] border border-[#1E3B32] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[#E9B94F] font-semibold text-xs tracking-wider uppercase">
                <Calculator className="w-4 h-4" />
                Member Savings Simulator
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Calculate Your Monthly Membership ROI
              </h2>
              <p className="text-neutral-300 text-sm max-w-xl">
                See how quickly a Cue Nation Gold or Black Velvet pass pays for itself based on your typical play frequency.
              </p>
            </div>

            {/* Game Selector Toggle */}
            <div className="inline-flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setPrefersGame("pool")}
                className={clsx(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  prefersGame === "pool" ? "bg-[#E9B94F] text-[#0A1917]" : "text-neutral-400 hover:text-white"
                )}
              >
                9ft Match Pool
              </button>
              <button
                onClick={() => setPrefersGame("snooker")}
                className={clsx(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  prefersGame === "snooker" ? "bg-[#E9B94F] text-[#0A1917]" : "text-neutral-400 hover:text-white"
                )}
              >
                12ft Snooker
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Slider Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-300 font-medium">Estimated hours you play per week:</span>
                  <span className="font-mono font-bold text-xl text-[#E9B94F]">
                    {weeklyHours} {weeklyHours === 1 ? "Hour" : "Hours"} / week
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#142C24] rounded-lg appearance-none cursor-pointer accent-[#E9B94F]"
                />
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>1 hr (Occasional)</span>
                  <span>5 hrs (Regular)</span>
                  <span>10+ hrs (League Pro)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <span className="text-neutral-400">Standard Non-Member Cost:</span>
                  <div className="font-mono font-bold text-lg text-white">
                    ₹{standardMonthlyCost.toLocaleString()} <span className="text-xs text-neutral-400">/ mo</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <span className="text-neutral-400">Total Hours / Month:</span>
                  <div className="font-mono font-bold text-lg text-white">
                    {weeklyHours * 4} Hours
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Output Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0F2922] to-[#081813] border-2 border-[#E9B94F]/60 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <span className="text-xs uppercase tracking-wider font-bold text-[#E9B94F]">
                Estimated Gold Baize Net Benefit
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-extrabold text-white">
                {netSavings > 0 ? (
                  <span className="text-[#34D399]">+₹{netSavings.toLocaleString()}</span>
                ) : (
                  <span className="text-neutral-300">Break-even</span>
                )}
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {netSavings > 0
                  ? `You save approximately ₹${netSavings.toLocaleString()} each month on table tariffs & roastery drinks after covering the Gold subscription!`
                  : `Play just ${Math.ceil(1499 / (hourlyRate * 0.2))} hours a month to completely break even on your Gold Club membership.`}
              </p>
              <button
                onClick={() => handleOpenJoin(TIERS[1])}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E9B94F] text-[#0A1917] font-bold text-xs uppercase tracking-wider hover:bg-[#F6D78D] transition-colors cursor-pointer shadow-md"
              >
                Claim Gold Benefits Now
              </button>
            </div>
          </div>
        </div>

        {/* Corporate & Private Venue Buyouts */}
        <div className="bg-[#041511] border border-[#172D26] rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[#E9B94F] text-xs font-semibold tracking-wider uppercase">
              <Trophy className="w-4 h-4" />
              Corporate Leagues & High-Roller Syndicates
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Looking for Company Passes or Full Parlour Buyouts?
            </h3>
            <p className="text-neutral-300 text-sm leading-relaxed">
              We offer bespoke corporate packages for startups, law firms, and social clubs. Includes dedicated
              recurring tables every Thursday, branded tournament bracket scoreboards, full espresso bar catering, and
              private cue master trick-shot masterclasses.
            </p>
          </div>
          <Link href="/services" className="shrink-0">
            <button className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2">
              <span>Explore Corporate Services</span>
              <ArrowRight className="w-4 h-4 text-[#E9B94F]" />
            </button>
          </Link>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="font-display text-2xl font-bold text-white">
              Frequently Asked Questions About Memberships
            </h3>
            <p className="text-neutral-400 text-sm">
              Clear terms, no hidden penalties, cancel anytime from your member portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-5 rounded-2xl bg-[#061814] border border-[#172D26] space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#E9B94F] shrink-0" />
                How do I redeem my discounts?
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Your member discount is automatically applied when booking online via your verified phone/email or when
                staff look up your name at the venue reception.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#061814] border border-[#172D26] space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#E9B94F] shrink-0" />
                Can I bring guests on my membership?
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Yes! Your table reservation covers you and up to 5 additional friends per table. The member hourly rate
                applies to the entire table session.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#061814] border border-[#172D26] space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#E9B94F] shrink-0" />
                What is the cue locker specification?
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Black Velvet lockers are solid teakwood, humidity-controlled, and individually locked with your personal
                digital code. They fit standard 1-piece and 2-piece cue cases with extension compartments.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#061814] border border-[#172D26] space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#E9B94F] shrink-0" />
                Can I pause or cancel my plan?
              </h4>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Monthly memberships can be paused or canceled at any time with one click in your account dashboard.
                There are zero cancellation fees or lock-ins.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Join Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          joinedSuccess
            ? "Welcome to Cue Nation Patron Club!"
            : `Join ${selectedTier?.name || "Membership"}`
        }
      >
        {joinedSuccess ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#E9B94F]/20 text-[#E9B94F] border border-[#E9B94F]/40 flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-midnight">
                Membership Activated!
              </h3>
              <p className="text-ash text-sm max-w-sm mx-auto">
                Congratulations <span className="font-bold text-midnight">{memberName}</span>! Your{" "}
                <span className="font-semibold text-baize">{selectedTier?.name}</span> privileges have been linked to
                your account.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-soft border border-bronze/20 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-ash">Member ID:</span>
                <span className="font-mono font-bold text-midnight">CN-MEM-88219</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Plan:</span>
                <span className="font-semibold text-midnight">{selectedTier?.name} ({billingCycle})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Status:</span>
                <span className="text-baize font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Immediately
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Link href="/#book-widget" onClick={() => setModalOpen(false)}>
                <Button variant="primary" className="gap-2">
                  <Calendar className="w-4 h-4" /> Book Member Table
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleJoinSubmit} className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-cream-soft border border-black/5 flex items-center justify-between text-xs">
              <span className="text-ash">Selected Tier:</span>
              <span className="font-bold text-midnight flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-bronze" /> {selectedTier?.name}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-midnight uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-midnight uppercase tracking-wider">
                Phone Number (For Venue PIN lookup)
              </label>
              <input
                type="tel"
                required
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-midnight uppercase tracking-wider">
                Email Address (For receipts & priority invites)
              </label>
              <input
                type="email"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#0A1917] text-white text-xs space-y-1">
              <div className="flex justify-between font-medium">
                <span>Dues:</span>
                <span className="font-mono text-[#E9B94F] font-bold">
                  {selectedTier?.monthlyPrice === 0
                    ? "Free"
                    : `₹${(billingCycle === "annual" ? selectedTier?.annualPrice || 0 : selectedTier?.monthlyPrice || 0).toLocaleString()} / mo`}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Cancel or upgrade at any time with zero penalties.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Complete Activation"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
