"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { BackButton } from "@/components/ui/BackButton";
import {
  Trophy,
  Medal,
  Calendar,
  Clock,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  ChevronRight,
  Target,
  Swords,
  Shield,
  CircleDot,
  Crown,
} from "lucide-react";
import clsx from "clsx";
import confetti from "canvas-confetti";

interface Tournament {
  id: string;
  title: string;
  discipline: "9-Ball Pool" | "Snooker" | "8-Ball Ball-Buster";
  arena: string;
  dateStr: string;
  timeStr: string;
  entryFee: number;
  prizePool: number;
  maxPlayers: number;
  registeredCount: number;
  status: "registering" | "live" | "completed";
  format: string;
  tag: string;
}

const UPCOMING_TOURNAMENTS: Tournament[] = [
  {
    id: "tourn-1",
    title: "Friday Midnight 9-Ball Shootout",
    discipline: "9-Ball Pool",
    arena: "Main Championship Arena (Tables 1 & 2)",
    dateStr: "Every Friday Evening",
    timeStr: "09:00 PM – 01:30 AM",
    entryFee: 750,
    prizePool: 25000,
    maxPlayers: 16,
    registeredCount: 13,
    status: "registering",
    format: "Race to 5 | Single Elimination | Winner Breaks",
    tag: "High Energy",
  },
  {
    id: "tourn-2",
    title: "The Aristocrat Snooker Century Trophy",
    discipline: "Snooker",
    arena: "Star Tournament 12ft Snooker Arena",
    dateStr: "Sunday, Oct 26",
    timeStr: "11:00 AM – 06:00 PM",
    entryFee: 1200,
    prizePool: 40000,
    maxPlayers: 16,
    registeredCount: 10,
    status: "registering",
    format: "Best of 3 Frames (Finals Best of 5) + ₹5,000 100+ Break Bounty",
    tag: "Prestigious",
  },
  {
    id: "tourn-3",
    title: "Corporate 8-Ball League: Season 4",
    discipline: "8-Ball Ball-Buster",
    arena: "Whole Venue (3 Arenas)",
    dateStr: "Starts Thursday, Nov 2",
    timeStr: "07:30 PM Weekly",
    entryFee: 4500,
    prizePool: 60000,
    maxPlayers: 8,
    registeredCount: 6,
    status: "registering",
    format: "Round Robin Group Stage -> Final 4 Knockout",
    tag: "Team Trophy",
  },
];

const LEADERBOARD_PROS = [
  {
    rank: 1,
    name: "Vikramaditya 'The Surgeon' Rao",
    fargo: 685,
    snookerHighBreak: 114,
    winRate: "78%",
    titles: 4,
    badge: "Current Champion",
  },
  {
    rank: 2,
    name: "Arjun 'Ghost Ball' Mehta",
    fargo: 660,
    snookerHighBreak: 98,
    winRate: "73%",
    titles: 3,
    badge: "Runners Up",
  },
  {
    rank: 3,
    name: "Devika Sen",
    fargo: 642,
    snookerHighBreak: 87,
    winRate: "70%",
    titles: 2,
    badge: "Rising Star",
  },
  {
    rank: 4,
    name: "Karan Singhania",
    fargo: 625,
    snookerHighBreak: 81,
    winRate: "66%",
    titles: 1,
  },
  {
    rank: 5,
    name: "Rohan Varma",
    fargo: 618,
    snookerHighBreak: 76,
    winRate: "64%",
    titles: 1,
  },
];

// Interactive Bracket Matches for Friday Shootout
const BRACKET_QUARTERS = [
  { match: "QF 1", p1: "Vikramaditya R. (5)", p2: "Sameer K. (2)", winner: "Vikramaditya R." },
  { match: "QF 2", p1: "Devika Sen (5)", p2: "Tanmay B. (4)", winner: "Devika Sen" },
  { match: "QF 3", p1: "Arjun Mehta (5)", p2: "Neil P. (1)", winner: "Arjun Mehta" },
  { match: "QF 4", p1: "Karan Singhania (5)", p2: "Zubair M. (3)", winner: "Karan Singhania" },
];

const BRACKET_SEMIS = [
  { match: "SF 1", p1: "Vikramaditya R.", p2: "Devika Sen", live: true },
  { match: "SF 2", p1: "Arjun Mehta", p2: "Karan Singhania", live: false },
];

export default function TournamentsPage() {
  const [selectedTourn, setSelectedTourn] = useState<Tournament | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regFargo, setRegFargo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleOpenRegister = (t: Tournament) => {
    setSelectedTourn(t);
    setRegisteredSuccess(false);
    setRegisterModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setRegisteredSuccess(true);
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#03120F] text-white selection:bg-[#E9B94F] selection:text-[#0A1917] pb-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[800px] h-[500px] bg-[radial-gradient(circle_at_top,rgba(233,185,79,0.1)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-[800px] left-10 w-96 h-96 bg-[#0B3B24]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-16">
        {/* Navigation Breadcrumb */}
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="dark" />
        </div>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E9B94F]/10 border border-[#E9B94F]/30 text-[#E9B94F] font-semibold text-xs tracking-widest uppercase">
            <Trophy className="w-4 h-4" />
            Competitive Arena & League Circuit
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Championship Tournaments <br />
            <span className="text-[#E9B94F] bg-gradient-to-r from-[#E9B94F] via-[#F6D78D] to-[#E9B94F] bg-clip-text text-transparent">
              & Live Arena Brackets
            </span>
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
            Test your stroke under real championship conditions. Weekly knockout shootouts, corporate team leagues,
            and Snooker century break bounties streamed live on our in-venue displays.
          </p>
        </div>

        {/* Upcoming Tournaments Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#E9B94F]" />
                Upcoming Open Tournaments
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Open to all amateurs, league players, and members. Advance registration required.
              </p>
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              Free entry waivers for <span className="text-[#E9B94F] font-bold">Black Velvet VIP Members</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {UPCOMING_TOURNAMENTS.map((t) => {
              const spotsLeft = t.maxPlayers - t.registeredCount;
              return (
                <div
                  key={t.id}
                  className="bg-gradient-to-b from-[#09221C] to-[#041410] border border-[#1A382F] hover:border-[#E9B94F]/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#E9B94F]/10 border border-[#E9B94F]/30 text-[#E9B94F] font-bold text-[11px] uppercase tracking-wider">
                        {t.discipline}
                      </span>
                      <span className="text-xs font-semibold text-[#34D399] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                        {spotsLeft} Spots Remaining
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-xl font-bold text-white group-hover:text-[#E9B94F] transition-colors">
                        {t.title}
                      </h3>
                      <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                        {t.arena}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#E9B94F]" /> Date & Time:
                        </span>
                        <span className="font-medium text-white">{t.dateStr}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#E9B94F]" /> Schedule:
                        </span>
                        <span className="font-medium text-white">{t.timeStr}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-[#E9B94F]" /> Prize Pool:
                        </span>
                        <span className="font-mono font-bold text-base text-[#E9B94F]">
                          ₹{t.prizePool.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-300 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <span className="text-[#E9B94F] font-bold">Format: </span>
                      {t.format}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase font-semibold">Entry Fee</div>
                      <div className="font-mono font-bold text-lg text-white">
                        ₹{t.entryFee}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenRegister(t)}
                      className="px-5 py-2.5 rounded-xl bg-[#E9B94F] hover:bg-[#F6D78D] text-[#0A1917] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Register Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Interactive Tournament Bracket Preview */}
        <div className="bg-gradient-to-b from-[#061B15] to-[#030F0C] border border-[#173027] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#E9B94F] tracking-wider uppercase flex items-center gap-1.5">
                <Swords className="w-4 h-4" /> Live Bracket Feed
              </span>
              <h3 className="font-display text-2xl font-bold text-white">
                Friday Midnight 9-Ball Knockout — Championship Stage
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              LIVE IN ARENA
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {/* Quarter Finals Column */}
            <div className="space-y-3">
              <div className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                Quarter Finals (Completed)
              </div>
              {BRACKET_QUARTERS.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs"
                >
                  <div className="text-[10px] text-neutral-500 font-mono">{q.match}</div>
                  <div className="flex justify-between items-center text-white font-medium">
                    <span className={clsx(q.p1.includes(q.winner) && "text-[#E9B94F] font-bold")}>
                      {q.p1}
                    </span>
                    {q.p1.includes(q.winner) && <CheckCircle2 className="w-3.5 h-3.5 text-[#E9B94F]" />}
                  </div>
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className={clsx(q.p2.includes(q.winner) && "text-[#E9B94F] font-bold")}>
                      {q.p2}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Semi Finals Column */}
            <div className="space-y-3">
              <div className="text-xs uppercase font-bold text-[#E9B94F] tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Semi Finals (In Play)
              </div>
              {BRACKET_SEMIS.map((s, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "p-4 rounded-2xl space-y-2 text-xs transition-all",
                    s.live
                      ? "bg-gradient-to-r from-[#0F2922] to-[#0A201A] border-2 border-[#E9B94F]/80 shadow-lg"
                      : "bg-black/40 border border-white/5 text-neutral-400"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-400 font-mono">{s.match}</span>
                    {s.live && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E9B94F] text-[#0A1917] text-[9px] font-extrabold uppercase">
                        Current Frame
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-white">{s.p1}</div>
                  <div className="text-neutral-400 text-xs">vs</div>
                  <div className="font-bold text-sm text-white">{s.p2}</div>
                </div>
              ))}
            </div>

            {/* Grand Finals Cup Column */}
            <div className="space-y-3">
              <div className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                Grand Championship
              </div>
              <div className="h-[280px] rounded-2xl bg-gradient-to-b from-black/60 to-black/30 border border-[#E9B94F]/30 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E9B94F]/10 border border-[#E9B94F]/40 flex items-center justify-center text-[#E9B94F]">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="font-display text-lg font-bold text-white">
                    ₹15,000 Winner Take All
                  </div>
                  <p className="text-[11px] text-neutral-400 max-w-[200px]">
                    Winner receives championship trophy, engraved plaque on venue wall, and automatic seed in State Open.
                  </p>
                </div>
                <span className="text-[10px] text-[#E9B94F] font-mono uppercase tracking-widest">
                  Scheduled 12:45 AM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Hall of Fame & Rankings Table */}
        <div className="bg-[#051713] border border-[#152B24] rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[#E9B94F] text-xs font-semibold tracking-wider uppercase">
                <Medal className="w-4 h-4" />
                Patron Leaderboard
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                Player Hall of Fame & Fargo Ratings
              </h3>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm">
              Updated weekly following Friday shootouts and weekend ranking frames.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-neutral-400 border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Player</th>
                  <th className="py-3 px-3">FargoRate</th>
                  <th className="py-3 px-3">Snooker High Break</th>
                  <th className="py-3 px-3">Win %</th>
                  <th className="py-3 px-3">Titles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {LEADERBOARD_PROS.map((pro) => (
                  <tr key={pro.rank} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-3 font-mono font-bold">
                      {pro.rank === 1 ? (
                        <span className="text-[#E9B94F] flex items-center gap-1">
                          <Crown className="w-4 h-4" /> #1
                        </span>
                      ) : (
                        `#${pro.rank}`
                      )}
                    </td>
                    <td className="py-4 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{pro.name}</span>
                        {pro.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-[#E9B94F]/10 border border-[#E9B94F]/30 text-[#E9B94F] text-[10px] font-bold">
                            {pro.badge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3 font-mono font-bold text-[#34D399]">
                      {pro.fargo}
                    </td>
                    <td className="py-4 px-3 font-mono text-neutral-300">
                      {pro.snookerHighBreak}
                    </td>
                    <td className="py-4 px-3 font-mono text-neutral-300">
                      {pro.winRate}
                    </td>
                    <td className="py-4 px-3 font-mono font-bold text-[#E9B94F]">
                      {pro.titles}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tournament Registration Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title={
          registeredSuccess
            ? "Tournament Entry Confirmed!"
            : `Register for ${selectedTourn?.title || "Tournament"}`
        }
      >
        {registeredSuccess ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#E9B94F]/20 text-[#E9B94F] border border-[#E9B94F]/40 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-midnight">
                You're in the Draw!
              </h3>
              <p className="text-ash text-sm max-w-sm mx-auto">
                Good luck, <span className="font-bold text-midnight">{regName}</span>! Your entry for the{" "}
                <span className="font-semibold text-baize">{selectedTourn?.title}</span> has been confirmed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-soft border border-bronze/20 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-ash">Seed Ref:</span>
                <span className="font-mono font-bold text-midnight">CN-SEED-09</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Discipline:</span>
                <span className="font-semibold text-midnight">{selectedTourn?.discipline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Arena:</span>
                <span className="text-midnight">{selectedTourn?.arena}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Prize Pool:</span>
                <span className="font-mono font-bold text-baize">₹{selectedTourn?.prizePool.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Button variant="primary" onClick={() => setRegisterModalOpen(false)}>
                Got It
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-cream-soft border border-black/5 text-xs space-y-1">
              <div className="flex justify-between font-bold text-midnight">
                <span>{selectedTourn?.title}</span>
                <span className="text-baize">Entry: ₹{selectedTourn?.entryFee}</span>
              </div>
              <p className="text-ash text-[11px]">{selectedTourn?.format}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-midnight uppercase tracking-wider">
                Competitor Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Aditya Sen"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-midnight uppercase tracking-wider">
                Mobile Number (For match notifications)
              </label>
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-midnight uppercase tracking-wider">
                Estimated FargoRate / High Break (Optional)
              </label>
              <input
                type="text"
                value={regFargo}
                onChange={(e) => setRegFargo(e.target.value)}
                placeholder="e.g. 550 or 45 Snooker break"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-white text-midnight text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setRegisterModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Locking Seed..." : "Confirm Tournament Entry"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
