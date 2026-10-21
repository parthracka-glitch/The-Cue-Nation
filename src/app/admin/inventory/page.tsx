"use client";

import React, { useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Boxes,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Search,
  RefreshCw,
  PackageCheck,
  PackageX,
  History,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: "Billiards Equipment" | "Coffee Beans & Milk" | "Kitchen Raw Stock" | "Packaging";
  quantity: number;
  unit: string;
  minThreshold: number;
  lastRestocked: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Aramith Tournament Pro Cue Chalk (Green)",
    category: "Billiards Equipment",
    quantity: 48,
    unit: "cubes",
    minThreshold: 20,
    lastRestocked: "2026-10-15",
  },
  {
    id: "inv-2",
    name: "Kamui Clear Black Medium Cue Tips (11mm)",
    category: "Billiards Equipment",
    quantity: 14,
    unit: "tips",
    minThreshold: 10,
    lastRestocked: "2026-10-10",
  },
  {
    id: "inv-3",
    name: "Single-Origin Chikmagalur Arabica (Dark Roast)",
    category: "Coffee Beans & Milk",
    quantity: 18.5,
    unit: "kg",
    minThreshold: 8,
    lastRestocked: "2026-10-18",
  },
  {
    id: "inv-4",
    name: "Artisanal Barista Oat Milk (1L Cartons)",
    category: "Coffee Beans & Milk",
    quantity: 6,
    unit: "cartons",
    minThreshold: 12,
    lastRestocked: "2026-10-14",
  },
  {
    id: "inv-5",
    name: "French White Truffle Infused Olive Oil (500ml)",
    category: "Kitchen Raw Stock",
    quantity: 3,
    unit: "bottles",
    minThreshold: 2,
    lastRestocked: "2026-10-08",
  },
  {
    id: "inv-6",
    name: "Strachan 6811 Gold Tournament Baize Cloth Rolls",
    category: "Billiards Equipment",
    quantity: 2,
    unit: "rolls",
    minThreshold: 3,
    lastRestocked: "2026-09-25",
  },
];

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;

    setInventory((prev) =>
      prev.map((item) =>
        item.id === restockModalItem.id
          ? {
              ...item,
              quantity: item.quantity + Number(restockQty),
              lastRestocked: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );
    setRestockModalItem(null);
  };

  const filteredItems = inventory.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const lowStockCount = inventory.filter((i) => i.quantity <= i.minThreshold).length;

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-bronze">
              Stock & Supply Chain
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Inventory & Equipment Supplies
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <span className="px-3 py-1.5 rounded-lg bg-amber/10 border border-amber/30 text-amber text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lowStockCount} Items Low in Stock
              </span>
            )}
          </div>
        </div>

        {/* Category Filter and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Supplies" },
              { id: "Billiards Equipment", label: "Billiards Gear" },
              { id: "Coffee Beans & Milk", label: "Coffee & Dairy" },
              { id: "Kitchen Raw Stock", label: "Kitchen Raw" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-bronze text-midnight border-bronze font-bold"
                    : "bg-midnight-card border-midnight-line text-ash hover:text-cream"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment or stock..."
              className="w-full pl-9 pr-3 py-1.5 bg-midnight-card border border-midnight-line rounded-lg text-xs text-cream placeholder-ash/50 focus:outline-none focus:border-bronze"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <Card variant="dark" className="p-0 overflow-hidden border-midnight-line">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight-card/80 border-b border-midnight-line text-ash uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Last Inwarded</th>
                  <th className="py-3 px-4 text-right">Inward / Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-line/60">
                {filteredItems.map((item) => {
                  const isLow = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-midnight-card/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-cream text-sm">{item.name}</div>
                        <div className="text-[11px] text-ash">SKU: #{item.id}</div>
                      </td>
                      <td className="py-3.5 px-4 text-ash">{item.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        <span className={isLow ? "text-rose-400 font-extrabold" : "text-emerald-400"}>
                          {item.quantity} {item.unit}
                        </span>
                        {isLow && (
                          <span className="ml-2 text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Reorder
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-ash">
                        Min. {item.minThreshold} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-ash font-mono">{item.lastRestocked}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRestockModalItem(item);
                            setRestockQty(10);
                          }}
                          className="text-xs text-bronze border-bronze/40 hover:bg-bronze/10"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Restock
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Restock Modal */}
        {restockModalItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-midnight-card border border-midnight-line rounded-2xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-midnight-line">
                <h3 className="font-display text-base font-bold text-cream">
                  Record Inward Restock
                </h3>
                <button onClick={() => setRestockModalItem(null)} className="text-ash hover:text-cream">
                  ✕
                </button>
              </div>

              <div className="text-xs text-ash">
                Inwarding stock for <strong className="text-cream">{restockModalItem.name}</strong>. Current level: {restockModalItem.quantity} {restockModalItem.unit}.
              </div>

              <form onSubmit={handleRestockSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ash">Quantity Added ({restockModalItem.unit})</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-midnight border border-midnight-line rounded-lg text-sm text-cream focus:outline-none focus:border-bronze"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setRestockModalItem(null)} className="text-ash">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="bg-bronze hover:bg-bronze-glow text-midnight font-bold">
                    Confirm Stock Update
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
