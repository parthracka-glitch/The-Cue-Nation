import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Camera,
  Flame,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

export function TableShowcase() {
  const tableSpecs = [
    {
      type: "POOL",
      title: "9ft Brunswick Gold Crown Slate",
      subtitle: "Official WPA Tournament Standard",
      badge: "Most Popular",
      badgeColor: "bg-emerald-600",
      description:
        "Engineered with 1-inch diamond-honed Brazilian slate and Simonis 860 worsted wool cloth for laser-straight ball roll and true bank angles.",
      specs: [
        { label: "Cloth", val: "Simonis 860 Tournament Green" },
        { label: "Slate", val: "1-inch 3-piece matched slate" },
        { label: "Balls", val: "Aramith Super Pro Cup TV Set" },
        { label: "Cues", val: "Peradon & Predator Carbon Cues" },
      ],
      features: ["Overhead 4K Camera Replay", "Drop-pocket Leather Catchers", "Custom Cue Racks"],
      actionLabel: "Reserve Pool Table",
      link: "/book?type=POOL",
    },
    {
      type: "SNOOKER",
      title: "12ft Championship Snooker Slate",
      subtitle: "BSFI Approved Match Specifications",
      badge: "Pro Grade",
      badgeColor: "bg-amber-600",
      description:
        "Full-size 12ft competition table featuring Strachan 6811 32oz West of England wool felt, Northern Rubber cushions, and thermostatically heated bed.",
      specs: [
        { label: "Cloth", val: "Strachan 6811 32oz Match Cloth" },
        { label: "Heating", val: "Under-slate thermostatic heating" },
        { label: "Pockets", val: "Tournament steel block cushions" },
        { label: "Balls", val: "Aramith Tournament Champion" },
      ],
      features: ["Precision Heated Slate Bed", "Electronic Digital Scoreboard", "Laser Leveling Verified"],
      actionLabel: "Reserve Snooker Table",
      link: "/book?type=SNOOKER",
    },
    {
      type: "CAROM",
      title: "Synco Championship Carom Arena",
      subtitle: "International Carrom Federation Standard",
      badge: "Classic Lounge",
      badgeColor: "bg-sky-600",
      description:
        "Handcrafted 3-inch English birch waterproof plywood board with quick-glide silicone powder and tournament jumbo regulation striker.",
      specs: [
        { label: "Surface", val: "English Birch Marine Plywood" },
        { label: "Rebound", val: "Kiln-dried Sissoo hardwood frame" },
        { label: "Powder", val: "Micro-smooth boric silicone glide" },
        { label: "Striker", val: "Synco 15g Tournament Jumbo" },
      ],
      features: ["Anti-glare overhead light canopy", "Padded lounge armchairs", "Table-side drink holders"],
      actionLabel: "Reserve Carom Board",
      link: "/book?type=CAROM",
    },
  ];

  return (
    <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="text-emerald-400 border-emerald-500/40 px-3 py-1 text-xs">
          <Trophy className="h-3.5 w-3.5 mr-1 text-amber-400" /> Professional Equipment Standards
        </Badge>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Engineered for Tournament Play. <br />
          <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
            Crafted for Lounge Luxury.
          </span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Every table is inspected, laser-leveled, and brushed daily. Experience the flawless roll of genuine Simonis felt and heated slate beds.
        </p>
      </div>

      {/* Grid of 3 Table Spec Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {tableSpecs.map((spec) => (
          <Card
            key={spec.type}
            className="border-border/80 bg-card/70 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-xl hover:shadow-2xl hover:shadow-emerald-950/40"
          >
            <div>
              {/* Header with badge */}
              <div className="p-6 pb-4 border-b border-border/60 bg-secondary/20">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold text-white uppercase px-2.5 py-0.5 rounded-full ${spec.badgeColor}`}>
                    {spec.badge}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {spec.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {spec.title}
                </h3>
                <p className="text-xs text-emerald-400 font-medium mt-1">
                  {spec.subtitle}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {spec.description}
                </p>

                {/* Specs Table */}
                <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2 text-xs">
                  {spec.specs.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">{item.label}:</span>
                      <span className="font-semibold text-white text-right">{item.val}</span>
                    </div>
                  ))}
                </div>

                {/* Feature Checkpoints */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Venue Enhancements
                  </span>
                  <div className="space-y-1.5">
                    {spec.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-emerald-200/90">
                        <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-6 pt-0">
              <Link href={spec.link} className="w-full block">
                <Button className="w-full gap-2 font-semibold text-xs h-11 bg-primary hover:bg-emerald-500 text-white">
                  {spec.actionLabel} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Feature Strip: 4K Replay, Heated Bed, Mobile POS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-billiard-900/60 via-billiard-950 to-billiard-900/60 backdrop-blur">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Overhead 4K Match Cameras</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Rewatch your best shots and bank combinations. Scan table QR code to view live angle replays.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Thermo-Regulated Heated Beds</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Snooker tables maintain optimal 21°C surface humidity, ensuring friction-free tournament cue ball speed.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Zero-Rounding Split Billing</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Play 43 minutes? Pay for 43 minutes. Split 4-ways via UPI or assign items individually at checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
