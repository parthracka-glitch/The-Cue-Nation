"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { formatINR, rupeesToPaise } from "@/lib/money";
import { Plus, Utensils, Coffee, Loader2, CheckCircle2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MenuManagementPage() {
  const { data, mutate, isLoading } = useSWR("/api/admin/menu", fetcher);
  const categories = data?.categories || [];

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemEmoji, setNewItemEmoji] = useState("🍽️");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleToggleAvailability(itemId: string, currentAvailable: boolean) {
    try {
      await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, available: !currentAvailable }),
      });
      mutate();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemCategory) return;
    setSubmitting(true);

    try {
      await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ITEM",
          name: newItemName.trim(),
          categoryId: newItemCategory,
          pricePaise: rupeesToPaise(parseFloat(newItemPrice)),
          emoji: newItemEmoji.trim() || "🍽️",
        }),
      });
      setNewItemName("");
      setNewItemPrice("");
      mutate();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Menu & Kitchen Catalog</h1>
          <p className="text-xs text-muted-foreground">
            Manage F&B menu items, stations, and toggle 86 item availability with immediate effect in POS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category & Item List (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
              Loading catalog...
            </div>
          ) : (
            categories.map((cat: any) => (
              <Card key={cat.id} className="border-border bg-card/80">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-white">{cat.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {cat.station}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{cat.items.length} items</span>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="divide-y divide-border/60">
                    {cat.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{item.imageEmoji || "🍽️"}</span>
                          <div>
                            <span
                              className={`font-semibold text-white block ${
                                !item.available ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {item.name}
                            </span>
                            <span className="text-emerald-400 font-mono text-[11px]">
                              {formatINR(item.pricePaise)}
                            </span>
                          </div>
                        </div>

                        {/* 86 Toggle */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {item.available ? "Available" : "86 (Sold Out)"}
                          </span>
                          <Switch
                            checked={item.available}
                            onCheckedChange={() =>
                              handleToggleAvailability(item.id, item.available)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add New Item Card (1 col) */}
        <div>
          <Card className="border-border bg-card/90 sticky top-20">
            <CardHeader className="p-4 pb-3 border-b border-border">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-400" /> Add Menu Item
              </CardTitle>
              <CardDescription className="text-xs">
                Creates new F&B item mapped to category and prep station
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleAddItem} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <Label className="text-xs">Item Name *</Label>
                  <Input
                    placeholder="e.g. Garlic Naan Pizza"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Price (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="180"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Emoji Icon</Label>
                    <Input
                      placeholder="🍕"
                      value={newItemEmoji}
                      onChange={(e) => setNewItemEmoji(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Category *</Label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-lg border border-border bg-secondary/80 px-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="">Select category...</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.station})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-10 text-xs font-semibold mt-2"
                >
                  {submitting ? "Adding..." : "Add to Menu"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
