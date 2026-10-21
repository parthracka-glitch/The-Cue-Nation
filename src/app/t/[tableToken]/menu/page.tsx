"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { venueStore } from "@/lib/store/venueStore";
import { GameTable, MenuItem, Session } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import confetti from "canvas-confetti";
import {
  Coffee,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

export default function TableQrMenuPage() {
  const params = useParams();
  const token = (params?.tableToken as string) || "table-3.demo";
  const tableId = token.split(".")[0] || "table-3";

  const [table, setTable] = useState<GameTable | null>(null);
  const [runningSession, setRunningSession] = useState<Session | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const loadData = () => {
    const t = venueStore.getTable(tableId) || venueStore.getTables()[2] || null;
    setTable(t);
    if (t) {
      const sess = venueStore.getRunningSessionForTable(t.id);
      setRunningSession(sess || null);
    }
    setMenu(venueStore.getMenu());
  };

  useEffect(() => {
    loadData();
    const unsub = venueStore.subscribe(loadData);
    return unsub;
  }, [tableId]);

  const categories = ["All", ...Array.from(new Set(menu.map((m) => m.category)))];

  const filteredMenu = menu.filter((item) => {
    if (!item.available) return false;
    if (selectedCategory === "All") return true;
    return item.category === selectedCategory;
  });

  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId] && next[itemId] > 1) {
        next[itemId] -= 1;
      } else {
        delete next[itemId];
      }
      return next;
    });
  };

  const totalItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotalAmount = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return acc + (item ? item.price * qty : 0);
  }, 0);

  const handlePlaceOrder = () => {
    if (!table || totalItemsCount === 0) return;
    setIsSubmitting(true);

    const items = Object.entries(cart).map(([menuItemId, qty]) => ({
      menuItemId,
      qty,
    }));

    setTimeout(() => {
      const res = venueStore.placeOrder(table.id, items);
      setIsSubmitting(false);

      if (res.success) {
        setCart({});
        setOrderSuccess(true);
        setLastOrderId(res.orderId || null);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      } else {
        alert(res.error || "Order failed");
      }
    }, 600);
  };

  // If table has NO running session, show blueprint copy: "No game running on this table. Ask staff to start one."
  if (!runningSession) {
    return (
      <div className="min-h-screen bg-midnight text-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-midnight-card border border-midnight-line rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber/15 text-amber flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-cream">
            Table Not Active
          </h1>
          <p className="text-sm text-mist leading-relaxed">
            No game is currently running on <span className="text-cream font-semibold">{table?.name || "this table"}</span>. Please show your reservation PIN to the staff concierge to start your session clock.
          </p>
          <div className="pt-2">
            <Button
              variant="primary-dark"
              size="md"
              onClick={() => {
                // For demo testing, auto-start a mock session if desired
                if (table) {
                  const now = new Date();
                  const end = new Date(now.getTime() + 60 * 60 * 1000);
                  const { booking, pin } = venueStore.createBooking({
                    tableId: table.id,
                    startISO: now.toISOString(),
                    endISO: end.toISOString(),
                    amount: 300,
                    source: "offline",
                    guestName: "Table QR Player",
                  });
                  venueStore.startSessionWithPin(booking.booking_code, pin);
                }
              }}
              className="w-full text-xs"
            >
              Simulate Floor Check-in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-cream pb-32">
      {/* Top Banner */}
      <div className="bg-midnight-card border-b border-midnight-line px-4 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-bronze-glow font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Table-Side Ordering</span>
            </div>
            <h1 className="font-display text-lg font-bold text-cream mt-0.5">
              {table?.name}
            </h1>
          </div>
          <div className="px-3 py-1 rounded-full bg-baize-light/15 text-baize-light border border-baize-light/30 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-baize-light animate-ping" />
            <span>Clock Active</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {orderSuccess && (
          <div className="p-4 rounded-xl bg-baize-dark border border-baize-light/40 text-cream flex items-start justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-baize-light flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Order Sent to Bar & Kitchen!</div>
                <div className="text-xs text-mist mt-0.5">
                  Ticket #{lastOrderId}. Your items will be brought directly to your table rail.
                </div>
              </div>
            </div>
            <button
              onClick={() => setOrderSuccess(false)}
              className="text-xs text-mist hover:text-cream"
            >
              ✕
            </button>
          </div>
        )}

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border",
                selectedCategory === cat
                  ? "bg-bronze-glow text-midnight border-bronze-glow shadow-sm"
                  : "bg-midnight-card text-mist border-midnight-line hover:text-cream"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="space-y-3">
          {filteredMenu.map((item) => {
            const qtyInCart = cart[item.id] || 0;

            return (
              <div
                key={item.id}
                className="bg-midnight-card border border-midnight-line p-4 rounded-2xl flex items-center justify-between gap-4 hover:border-bronze-glow/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-midnight-line"
                    />
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-bronze-glow tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-sm sm:text-base text-cream">
                      {item.name}
                    </h3>
                    <div className="font-display text-sm font-bold text-cream mt-0.5 tabular-nums">
                      ₹{item.price}
                    </div>
                  </div>
                </div>

                {/* Qty Selector */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {qtyInCart > 0 ? (
                    <div className="flex items-center gap-2 bg-midnight p-1 rounded-xl border border-midnight-line">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-lg bg-midnight-card hover:bg-midnight-line text-cream flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-cream tabular-nums">
                        {qtyInCart}
                      </span>
                      <button
                        onClick={() => addToCart(item.id)}
                        className="w-7 h-7 rounded-lg bg-bronze-glow text-midnight flex items-center justify-center cursor-pointer font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary-dark"
                      size="sm"
                      onClick={() => addToCart(item.id)}
                      className="text-xs gap-1 py-1 px-3"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-midnight/95 backdrop-blur-md border-t border-midnight-line z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-mist">
                {totalItemsCount} item{totalItemsCount > 1 ? "s" : ""} selected
              </div>
              <div className="font-display text-xl font-bold text-bronze-glow tabular-nums">
                ₹{cartTotalAmount}
              </div>
            </div>

            <Button
              variant="primary-dark"
              size="md"
              isLoading={isSubmitting}
              onClick={handlePlaceOrder}
              className="shadow-lamp gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-midnight" />
              Place Order to Table
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
