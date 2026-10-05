"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, QrCode, Sparkles, Coffee, Pizza, Wine, Sandwich } from "lucide-react";

export function CafeShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<"BREWS" | "BURGERS" | "PIZZA" | "COOLERS">("BREWS");

  const menuData = {
    BREWS: [
      {
        emoji: "☕",
        name: "Artisan Flat White",
        category: "Single Origin Arabica",
        pricePaise: 18000,
        desc: "Double ristretto shot with velvety microfoam poured over rich dark chocolate notes.",
        tag: "Barista Special",
      },
      {
        emoji: "🧊",
        name: "Iced Spanish Latte",
        category: "Cold Brew Craft",
        pricePaise: 22000,
        desc: "Slow-drip cold espresso layered with condensed milk and chilled whole milk over crystal ice.",
        tag: "Bestseller",
      },
      {
        emoji: "🍫",
        name: "Belgian Dark Mocha Shake",
        category: "Lounge Shakes",
        pricePaise: 26000,
        desc: "70% Callebaut dark chocolate blended with vanilla gelato and espresso crumble.",
        tag: "Signature",
      },
      {
        emoji: "🍵",
        name: "Kyoto Matcha Green Latte",
        category: "Artisan Tea",
        pricePaise: 24000,
        desc: "Ceremonial grade Uji matcha whisked with warm oat milk and organic blossom honey.",
        tag: "Wellness",
      },
    ],
    BURGERS: [
      {
        emoji: "🍔",
        name: "Truffle Mushroom Smash Burger",
        category: "Gourmet Sliders",
        pricePaise: 38000,
        desc: "Double smashed tender patty, caramelized shallots, melted aged cheddar, and black truffle aioli in brioche.",
        tag: "Chef's Special",
      },
      {
        emoji: "🍗",
        name: "Nashville Hot Crispy Chicken",
        category: "Spicy Bites",
        pricePaise: 34000,
        desc: "Buttermilk brined chicken thigh fried extra crispy with cayenne glaze, house pickles, and herb ranch.",
        tag: "Popular",
      },
      {
        emoji: "🥪",
        name: "Smoked Paneer & Pesto Panini",
        category: "Vegetarian Craft",
        pricePaise: 29000,
        desc: "Chargrilled cottage cheese, basil walnut pesto, sundried tomatoes, and fresh mozzarella on sourdough.",
        tag: "Vegetarian",
      },
      {
        emoji: "🍟",
        name: "Parmesan Truffle Fries",
        category: "Cue-side Finger Food",
        pricePaise: 21000,
        desc: "Crispy double-cooked skin-on fries tossed in white truffle oil, rosemary sea salt, and aged parmesan.",
        tag: "Table Favorite",
      },
    ],
    PIZZA: [
      {
        emoji: "🍕",
        name: "Burrata & San Marzano Woodfired",
        category: "11-inch Neapolitan",
        pricePaise: 44000,
        desc: "San Marzano D.O.P. tomato sauce, creamy Pugliese burrata, fresh Genovese basil, and extra virgin olive oil.",
        tag: "Signature",
      },
      {
        emoji: "🌶️",
        name: "Fiery Pepperoni & Hot Honey",
        category: "11-inch Neapolitan",
        pricePaise: 49000,
        desc: "Artisanal smoked pepperoni, spicy n’duja crumble, fresh mozzarella, finished with chili wildflower honey.",
        tag: "Bestseller",
      },
      {
        emoji: "🧀",
        name: "Quattro Formaggi Bianca",
        category: "White Sauce Pizza",
        pricePaise: 46000,
        desc: "Fior di latte, Gorgonzola dolce, smoked scamorza, and 24-month Parmigiano-Reggiano with roasted garlic.",
        tag: "Classic",
      },
      {
        emoji: "🍄",
        name: "Wild Forest Mushroom & Truffle",
        category: "Vegetarian Craft",
        pricePaise: 42000,
        desc: "Roasted cremini and shiitake mushrooms, thyme garlic cream, taleggio cheese, and white truffle glaze.",
        tag: "Vegetarian",
      },
    ],
    COOLERS: [
      {
        emoji: "🍹",
        name: "Smoked Rosemary Passion Cooler",
        category: "Craft Mocktail",
        pricePaise: 23000,
        desc: "Fresh passionfruit pulp, lime juice, sparkling botanical tonic water, garnished with torched rosemary.",
        tag: "House Special",
      },
      {
        emoji: "🍋",
        name: "Elderflower Citrus Spritz",
        category: "Sparkling Refresher",
        pricePaise: 21000,
        desc: "Elderflower cordial, yuzu citrus, fresh mint leaves, and effervescent sparkling mineral water.",
        tag: "Refreshing",
      },
      {
        emoji: "🍓",
        name: "Wild Berry Basil Fizz",
        category: "Artisan Fizz",
        pricePaise: 22000,
        desc: "Muddled blackberries, raspberries, sweet Thai basil, fresh lime, and ginger ale.",
        tag: "Zero Proof",
      },
      {
        emoji: "🥥",
        name: "Pineapple Yuzu Coconut Cooler",
        category: "Tropical Blend",
        pricePaise: 24000,
        desc: "Cold-pressed coastal pineapple, fresh tender coconut water, yuzu zest, and vanilla sea salt.",
        tag: "Hydration",
      },
    ],
  };

  return (
    <section className="py-20 bg-gradient-to-b from-billiard-950 via-billiard-900/40 to-billiard-950 border-t border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge variant="outline" className="text-amber-400 border-amber-500/40 px-3 py-1 text-xs">
              <Utensils className="h-3.5 w-3.5 mr-1" /> CueClub Kitchen & Bar
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Gourmet Dining Delivered Cue-Side.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Order artisanal coffee, wood-fired pizzas, and gourmet burgers directly from your table card. Kitchen Order Tickets (KOT) sync in real-time to the kitchen display screen.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/80 border border-emerald-500/30 text-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 shrink-0">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white block">Table QR POS Ordering</span>
              <span className="text-[11px] text-muted-foreground">
                Charges automatically appended to your match bill
              </span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60">
          {[
            { id: "BREWS", label: "Specialty Brews & Shakes", icon: Coffee },
            { id: "BURGERS", label: "Gourmet Burgers & Bites", icon: Sandwich },
            { id: "PIZZA", label: "Woodfired Pizzas", icon: Pizza },
            { id: "COOLERS", label: "Signature Mocktails", icon: Wine },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-950/40"
                    : "bg-secondary/40 text-muted-foreground hover:text-white hover:bg-secondary/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuData[selectedCategory].map((item, idx) => (
            <Card
              key={idx}
              className="border-border/80 bg-card/70 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg hover:shadow-xl"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="text-4xl p-2 rounded-2xl bg-secondary/40 border border-border/60">
                    {item.emoji}
                  </div>
                  <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30">
                    {item.tag}
                  </Badge>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground font-mono block">
                    {item.category}
                  </span>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatINR(item.pricePaise)}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Live Kitchen KOT
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
