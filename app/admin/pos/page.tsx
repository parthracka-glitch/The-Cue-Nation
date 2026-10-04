"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/money";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  Printer,
  ShoppingBag,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CartItem {
  menuItemId: string;
  name: string;
  pricePaise: number;
  quantity: number;
  notes: string;
  assignedToPlayer: string;
}

function PosContent() {
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("sessionId") || "";
  const initialTableId = searchParams.get("tableId") || "";

  const { data, mutate, isLoading } = useSWR("/api/admin/pos", fetcher);

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId);
  const [selectedTableId, setSelectedTableId] = useState(initialTableId);
  const [orderTarget, setOrderTarget] = useState<"SESSION" | "TAKEAWAY">(
    initialSessionId ? "SESSION" : "TAKEAWAY"
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial session if loaded later
  useEffect(() => {
    if (initialSessionId && data?.activeSessions) {
      setSelectedSessionId(initialSessionId);
      const session = data.activeSessions.find((s: any) => s.id === initialSessionId);
      if (session) setSelectedTableId(session.tableId);
      setOrderTarget("SESSION");
    }
  }, [initialSessionId, data]);

  const categories = data?.categories || [];
  const activeSessions = data?.activeSessions || [];

  // Filter menu items
  const allItems = categories.flatMap((cat: any) =>
    (cat.items || []).map((item: any) => ({ ...item, categoryName: cat.name, station: cat.station }))
  );

  const filteredItems = allItems.filter((item: any) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.categoryName === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  function addToCart(item: any) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          pricePaise: item.pricePaise,
          quantity: 1,
          notes: "",
          assignedToPlayer: "Player 1",
        },
      ];
    });
  }

  function updateQuantity(menuItemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }

  function removeItem(menuItemId: string) {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }

  function updateNotes(menuItemId: string, notes: string) {
    setCart((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, notes } : i))
    );
  }

  function updatePlayer(menuItemId: string, assignedToPlayer: string) {
    setCart((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, assignedToPlayer } : i))
    );
  }

  // Totals calculations
  const subtotalPaise = cart.reduce(
    (acc, item) => acc + item.pricePaise * item.quantity,
    0
  );
  const taxPaise = Math.round(subtotalPaise * 0.05); // 5% GST
  const totalPaise = subtotalPaise + taxPaise;

  // Submit order to kitchen
  async function handleSendToKitchen() {
    if (cart.length === 0) return;
    setError(null);
    setSubmitting(true);
    setOrderSuccess(false);

    try {
      const payload: any = {
        targetType: orderTarget === "SESSION" ? "DINE_IN_TABLE" : "TAKEAWAY",
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          unitPricePaise: i.pricePaise,
          quantity: i.quantity,
          notes: i.notes || null,
          assignedToCustomerId: i.assignedToPlayer,
        })),
      };

      if (orderTarget === "SESSION") {
        if (!selectedSessionId) {
          setError("Please select an active table session for dine-in");
          setSubmitting(false);
          return;
        }
        payload.sessionId = selectedSessionId;
        payload.tableId = selectedTableId;
      }

      const res = await fetch("/api/admin/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Order submission failed");
      } else {
        setOrderSuccess(true);
        setCart([]);
        setTimeout(() => setOrderSuccess(false), 4000);
      }
    } catch (e) {
      setError("Network error submitting order");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePrintKOT() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cafe POS & Orders</h1>
          <p className="text-xs text-muted-foreground">
            Fast touch order entry. Items sent to kitchen append immediately to the table session folio.
          </p>
        </div>

        {orderSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-300 font-semibold animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>KOT sent to kitchen & folio updated!</span>
          </div>
        )}
      </div>

      {/* Main Dual-Pane POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Menu Categories & Items Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coffee, fries, burger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <Button
                variant={selectedCategory === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("ALL")}
                className="text-xs h-8 whitespace-nowrap"
              >
                All Menu ({allItems.length})
              </Button>
              {categories.map((cat: any) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                  className="text-xs h-8 whitespace-nowrap gap-1.5"
                >
                  <span>{cat.name}</span>
                  <Badge variant="outline" className="text-[9px] py-0 px-1 opacity-70">
                    {cat.items.length}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-400 mx-auto mb-2" />
              <span className="text-xs text-muted-foreground">Loading menu items...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredItems.map((item: any) => (
                <Card
                  key={item.id}
                  onClick={() => item.available && addToCart(item)}
                  className={`p-3.5 border transition-all cursor-pointer select-none ${
                    item.available
                      ? "border-border bg-card/80 hover:border-emerald-500/60 hover:bg-secondary/40 active:scale-[0.98]"
                      : "opacity-40 cursor-not-allowed border-zinc-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{item.imageEmoji || "🍽️"}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
                      {item.station}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xs font-semibold text-white leading-tight line-clamp-1">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {item.categoryName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <span className="text-xs font-bold text-emerald-400">
                      {formatINR(item.pricePaise)}
                    </span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-primary/20">
                      <Plus className="h-3.5 w-3.5 text-emerald-300" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Order Cart & Folio Append (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="border-border bg-card/90 shadow-xl sticky top-20">
            <CardHeader className="p-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  Order Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCart([])}
                    className="h-7 text-[11px] text-muted-foreground hover:text-red-400"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Order Target: Table Session vs Takeaway */}
              <div className="pt-3 space-y-2">
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-secondary/60">
                  <button
                    type="button"
                    onClick={() => setOrderTarget("SESSION")}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      orderTarget === "SESSION"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Table Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderTarget("TAKEAWAY")}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      orderTarget === "TAKEAWAY"
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Takeaway / Bar
                  </button>
                </div>

                {orderTarget === "SESSION" && (
                  <select
                    value={selectedSessionId}
                    onChange={(e) => {
                      const sessId = e.target.value;
                      setSelectedSessionId(sessId);
                      const s = activeSessions.find((x: any) => x.id === sessId);
                      if (s) setSelectedTableId(s.tableId);
                    }}
                    className="flex h-9 w-full rounded-lg border border-border bg-secondary/80 px-2.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="">Select active table session...</option>
                    {activeSessions.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.tableName} • {s.customerName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {error && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                  {error}
                </div>
              )}

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  <Utensils className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Your cart is empty. Select items from the menu to start order.
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="p-2.5 rounded-xl border border-border bg-secondary/30 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-white block">{item.name}</span>
                          <span className="text-[11px] text-emerald-400">
                            {formatINR(item.pricePaise)} each
                          </span>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-1.5 bg-secondary/80 rounded-lg p-0.5 border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.menuItemId, -1)}
                            className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-white hover:bg-card"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-xs w-5 text-center text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.menuItemId, 1)}
                            className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-white hover:bg-card"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Split assignment & note row */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Assign to (Split)</Label>
                          <select
                            value={item.assignedToPlayer}
                            onChange={(e) => updatePlayer(item.menuItemId, e.target.value)}
                            className="h-7 w-full rounded border border-border bg-secondary/60 px-1.5 text-[11px] text-foreground focus:outline-none"
                          >
                            <option value="Player 1">Player 1</option>
                            <option value="Player 2">Player 2</option>
                            <option value="Player 3">Player 3</option>
                            <option value="Player 4">Player 4</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-[10px] text-muted-foreground">Kitchen Note</Label>
                          <input
                            type="text"
                            placeholder="e.g. Extra spicy"
                            value={item.notes}
                            onChange={(e) => updateNotes(item.menuItemId, e.target.value)}
                            className="h-7 w-full rounded border border-border bg-secondary/60 px-2 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Calculation Summary */}
              {cart.length > 0 && (
                <div className="space-y-1.5 pt-3 border-t border-border text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>F&B Subtotal:</span>
                    <span className="text-white">{formatINR(subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (5%):</span>
                    <span className="text-white">{formatINR(taxPaise)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-emerald-400 pt-1 border-t border-border">
                    <span>Total Amount:</span>
                    <span>{formatINR(totalPaise)}</span>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintKOT}
                disabled={cart.length === 0}
                className="gap-1.5 text-xs h-11"
                title="80mm Thermal Receipt Preview"
              >
                <Printer className="h-4 w-4" /> KOT Print
              </Button>

              <Button
                variant="default"
                size="sm"
                disabled={cart.length === 0 || submitting}
                onClick={handleSendToKitchen}
                className="flex-1 text-xs font-semibold gap-2 h-11"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send to Kitchen
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Hidden 80mm Thermal KOT Print Sheet for window.print() */}
      <div id="printable-receipt" className="hidden">
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>CUECLUB KOT</h2>
          <p style={{ fontSize: "11px", margin: "2px 0" }}>
            Target: {orderTarget === "SESSION" ? `Table Session` : "Takeaway"}
          </p>
          <p style={{ fontSize: "10px", margin: 0 }}>
            {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
          </p>
        </div>
        <hr style={{ borderTop: "1px dashed black" }} />
        <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid black", textAlign: "left" }}>
              <th>Qty</th>
              <th>Item</th>
              <th style={{ textAlign: "right" }}>Player</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((i, idx) => (
              <tr key={idx}>
                <td>{i.quantity}x</td>
                <td>
                  {i.name}
                  {i.notes && <div style={{ fontSize: "10px" }}>* {i.notes}</div>}
                </td>
                <td style={{ textAlign: "right", fontSize: "10px" }}>{i.assignedToPlayer}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr style={{ borderTop: "1px dashed black" }} />
        <div style={{ textAlign: "center", fontSize: "10px", marginTop: "4px" }}>
          *** END OF KOT ***
        </div>
      </div>
    </div>
  );
}

export default function PosPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mr-2" />
          <span>Loading Cafe POS...</span>
        </div>
      }
    >
      <PosContent />
    </React.Suspense>
  );
}
