"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ChevronDown, ChevronUp, MessageSquare, ShieldCheck, HeartHandshake } from "lucide-react";

export function ReviewsAndFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const reviews = [
    {
      name: "Vikram Singhania",
      role: "State Snooker Finalist",
      rating: 5,
      date: "Played 2 days ago",
      comment:
        "The Strachan 6811 match cloth and heated slate bed play true to world tournament standards. Best cue sports venue in NCR by a mile.",
      verified: "Verified Pro Player",
    },
    {
      name: "Ananya Deshmukh",
      role: "Corporate Weekend Group Host",
      rating: 5,
      date: "Played last Saturday",
      comment:
        "Booked 3 pool tables for our team offsite. The split-billing by UPI QR made settling up effortless, and the wood-fired pizzas delivered right to our tables were phenomenal.",
      verified: "Verified Booking",
    },
    {
      name: "Karan Mehta",
      role: "Gold VIP Member",
      rating: 5,
      date: "Regular Player (18 sessions)",
      comment:
        "Minute-by-minute billing means zero wasted hours. If we play 45 minutes, we pay for exactly 45 minutes. The 20% member discount makes it unmatched value.",
      verified: "VIP Member",
    },
  ];

  const faqs = [
    {
      q: "Can I walk in or is advance online reservation required?",
      a: "Walk-ins are always warmly welcomed! However, Friday evenings and weekends experience high demand. We strongly recommend booking 1–2 hours in advance via our online booking engine to guarantee your preferred table style and avoid wait times.",
    },
    {
      q: "How does the transparent minute-by-minute billing work?",
      a: "Unlike traditional clubs that round up to full 60-minute blocks, CueClub charges strictly for the exact minutes played. If you play for 38 minutes or 1 hour 17 minutes, our automated timing engine prorates the exact rate band down to the minute. A 5-minute grace period is included when starting your session.",
    },
    {
      q: "Can I split the table bill and food orders between multiple players?",
      a: "Yes! Our digital checkout system offers 4 split modes: Even Split (equal division), Split by Item (each guest pays for their own food/frames), 4-Way UPI QR Codes on the counter screen, or Loser Pays All (the match loser covers the table time while others pay for cafe bites).",
    },
    {
      q: "What equipment is provided, and can I bring my own cues?",
      a: "We provide professional Peradon English ash cues, Predator carbon fiber break cues, Aramith Tournament TV ball sets, and Taom chalk. Players are also completely welcome to bring their own cues. We also provide secure cue lockers for Gold and Platinum VIP members.",
    },
    {
      q: "What is your reservation cancellation and deposit policy?",
      a: "Reservations require a 20% deposit during online booking to prevent no-shows. Cancellations made more than 2 hours before your scheduled start time receive an instant 100% wallet credit or refund via our self-service 'Find My Booking' portal.",
    },
  ];

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-20">
      {/* Testimonials */}
      <div className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/40 px-3 py-1 text-xs">
            <HeartHandshake className="h-3.5 w-3.5 mr-1" /> Player Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Trusted by Serious Players & Weekend Crews
          </h2>
          <p className="text-sm text-muted-foreground">
            Over 15,000 matches hosted with a 4.9-star rating across NCR
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <Card
              key={i}
              className="border-border/80 bg-card/70 hover:border-emerald-700/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{r.date}</span>
                </div>

                <p className="text-sm text-emerald-100/90 italic leading-relaxed">
                  "{r.comment}"
                </p>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">{r.name}</h5>
                    <span className="text-xs text-muted-foreground">{r.role}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/30 gap-1">
                    <ShieldCheck className="h-3 w-3" /> {r.verified}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-amber-400 border-amber-500/40 px-3 py-1 text-xs">
            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Got Questions?
          </Badge>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-muted-foreground">
            Everything you need to know about our tables, billing, and lounge rules
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-white hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <Link href="/book">
            <Button size="lg" variant="gold" className="font-bold text-sm px-8 shadow-xl shadow-amber-950/40">
              Ready to Play? Reserve Your Table Online
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
