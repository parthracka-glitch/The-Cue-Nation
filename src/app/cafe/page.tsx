"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Coffee,
  UtensilsCrossed,
  Sparkles,
  Leaf,
  Clock,
  Flame,
  Award,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import { BackButton } from "@/components/ui/BackButton";

interface CafeItem {
  id: string;
  name: string;
  category: "coffee" | "drinks" | "bites" | "mains" | "dessert";
  price: number;
  description: string;
  tag?: string;
  veg: boolean;
  image: string;
}

const CAFE_MENU: CafeItem[] = [
  {
    id: "c-1",
    name: "Signature Baize Cold Brew",
    category: "coffee",
    price: 180,
    description: "16-hour slow-steeped single-origin Chikmagalur Arabica over hand-carved ice sphere with subtle dark cocoa and orange zest notes.",
    tag: "CueNation Classic",
    veg: true,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "c-2",
    name: "Smoked Bronze Macchiato",
    category: "coffee",
    price: 150,
    description: "Double ristretto shot pulled through lightly smoked oak wood with velvety textured microfoam.",
    tag: "Barista Special",
    veg: true,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "c-3",
    name: "Artisanal Flat White",
    category: "coffee",
    price: 190,
    description: "Velvety steamed oat or whole milk folded into double-shot estate espresso with intricate rosette latte art.",
    veg: true,
    image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "c-4",
    name: "Midnight Cascara Fizz",
    category: "drinks",
    price: 160,
    description: "Effervescent coffee cherry infusion sparkling tonic with fresh muddled mint and lime reduction.",
    tag: "Refreshing",
    veg: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "c-5",
    name: "Truffle Parmesan Hand-Cut Fries",
    category: "bites",
    price: 240,
    description: "Crispy double-cooked Russet potato batons tossed in white truffle oil, freshly grated 24-month aged Parmigiano Reggiano, and rosemary salt.",
    tag: "Table Favorite",
    veg: true,
    image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "c-6",
    name: "Smoked Chicken & Sourdough Club",
    category: "mains",
    price: 320,
    description: "Hickory-smoked chicken breast, butterhead lettuce, heirloom tomatoes, and garlic emulsion on grilled artisanal sourdough.",
    veg: false,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "c-7",
    name: "Charred Paneer Pesto Brioche",
    category: "mains",
    price: 290,
    description: "Flame-kissed malai paneer steaks with house-made walnut basil pesto, buffalo mozzarella, and pickled jalapeños on brioche.",
    tag: "Chef Curated",
    veg: true,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "c-8",
    name: "Warm Valrhona Lava Pot",
    category: "dessert",
    price: 260,
    description: "70% Valrhona dark molten chocolate cake baked à la minute with a scoop of Madagascar bourbon vanilla gelato.",
    veg: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
  },
];

export default function CafePage() {
  const [activeTab, setActiveTab] = useState<"all" | "coffee" | "drinks" | "bites" | "mains" | "dessert">("all");

  const filteredItems = activeTab === "all" ? CAFE_MENU : CAFE_MENU.filter((item) => item.category === activeTab);

  return (
    <div className="min-h-screen bg-midnight text-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Navigation */}
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="dark" />
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bronze/10 border border-bronze/20 text-xs font-semibold text-bronze uppercase tracking-widest">
            <Coffee className="w-3.5 h-3.5" />
            Specialty Roastery & Parlour Kitchen
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-cream">
            The CueNation Café
          </h1>
          <p className="text-ash text-sm sm:text-base leading-relaxed">
            Crafted for focused breaks and late-night frames. Every espresso shot is weighed,
            and every snack is prepared à la minute with table-side service.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { id: "all", label: "Full Menu" },
            { id: "coffee", label: "Specialty Coffee" },
            { id: "drinks", label: "Refreshments & Brews" },
            { id: "bites", label: "Snacks & Sides" },
            { id: "mains", label: "Gourmet Mains" },
            { id: "dessert", label: "Desserts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border",
                activeTab === tab.id
                  ? "bg-bronze text-midnight border-bronze shadow-lg shadow-bronze/20 font-bold"
                  : "bg-midnight-card/80 border-midnight-line text-ash hover:text-cream hover:border-bronze/40"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              variant="dark"
              className="p-0 overflow-hidden flex flex-col justify-between border-midnight-line hover:border-bronze/50 transition-all duration-300 group"
            >
              <div className="relative h-48 w-full overflow-hidden bg-midnight-card">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/30 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={clsx(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold",
                      item.veg ? "border-emerald-500 text-emerald-500" : "border-rose-500 text-rose-500"
                    )}
                  >
                    ●
                  </span>
                  {item.tag && (
                    <span className="bg-bronze/90 text-midnight text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {item.tag}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 bg-midnight/90 backdrop-blur-md px-3 py-1 rounded-lg border border-bronze/30 text-bronze font-bold text-sm">
                  ₹{item.price}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-cream group-hover:text-bronze transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-ash mt-1.5 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-midnight-line/60 flex items-center justify-between text-[11px] text-ash">
                  <span className="flex items-center gap-1 text-baize-light">
                    <Clock className="w-3.5 h-3.5" />
                    Served table-side in 8–12 mins
                  </span>
                  <span className="text-bronze font-medium">Billed to session</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order at table banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-baize/20 via-midnight-card to-bronze/10 border border-baize/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-display text-lg font-bold text-cream">
              Playing a session right now?
            </h4>
            <p className="text-xs text-ash">
              Ask your floor attendant or scan your table QR code to add café orders directly to your consolidated bill.
            </p>
          </div>
          <Link href="/book">
            <Button variant="primary" className="whitespace-nowrap">
              Book a Table & Play
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
