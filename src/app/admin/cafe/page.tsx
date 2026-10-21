"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { venueStore } from "@/lib/store/venueStore";
import { MenuItem } from "@/types/database";
import {
  Coffee,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  DollarSign,
  Tag,
  RefreshCw,
} from "lucide-react";

export default function AdminCafePage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Coffee");
  const [price, setPrice] = useState<number>(150);
  const [available, setAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  const reload = () => {
    setMenu(venueStore.getMenu());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const openNewModal = () => {
    setEditingItem(null);
    setName("");
    setCategory("Coffee");
    setPrice(150);
    setAvailable(true);
    setImageUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setAvailable(item.available);
    setImageUrl(item.image_url || "");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      // Update existing item
      editingItem.name = name.trim();
      editingItem.category = category;
      editingItem.price = Number(price);
      editingItem.available = available;
      if (imageUrl) editingItem.image_url = imageUrl.trim();
    } else {
      // Add new item
      const newItem: MenuItem = {
        id: `m-${Date.now()}`,
        name: name.trim(),
        category,
        price: Number(price),
        available,
        image_url: imageUrl.trim() || undefined,
      };
      menu.push(newItem);
    }

    venueStore.refresh();
    setIsModalOpen(false);
    reload();
  };

  const toggleAvailability = (item: MenuItem) => {
    item.available = !item.available;
    venueStore.refresh();
    reload();
  };

  const filteredItems = menu.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const categories = ["all", ...Array.from(new Set(menu.map((m) => m.category)))];

  return (
    <div className="min-h-screen bg-midnight text-cream py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminNav />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-bronze">
              F&B Catalog & POS Pricing
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Café Menu Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={reload}
              className="text-ash border-midnight-line hover:text-cream"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={openNewModal}
              className="bg-bronze hover:bg-bronze-glow text-midnight font-bold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Menu Item
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${
                  activeCategory === cat
                    ? "bg-bronze text-midnight border-bronze font-bold"
                    : "bg-midnight-card border-midnight-line text-ash hover:text-cream"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or drinks..."
              className="w-full pl-9 pr-3 py-1.5 bg-midnight-card border border-midnight-line rounded-lg text-xs text-cream placeholder-ash/50 focus:outline-none focus:border-bronze"
            />
          </div>
        </div>

        {/* Menu Items Table */}
        <Card variant="dark" className="p-0 overflow-hidden border-midnight-line">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-midnight-card/80 border-b border-midnight-line text-ash uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (INR)</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight-line/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-midnight-card/50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-midnight-line"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-bronze/10 border border-bronze/20 flex items-center justify-center text-bronze">
                          <Coffee className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-cream text-sm">{item.name}</div>
                        <div className="text-[11px] text-ash">ID: #{item.id}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ash font-medium">{item.category}</td>
                    <td className="py-3.5 px-4 font-bold text-bronze-glow text-sm">₹{item.price}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border transition-all ${
                          item.available
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                        }`}
                      >
                        {item.available ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Sold Out
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(item)}
                        className="text-xs text-ash hover:text-cream"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal for Add/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-midnight-card border border-midnight-line rounded-2xl max-w-md w-full p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-midnight-line">
                <h3 className="font-display text-lg font-bold text-cream">
                  {editingItem ? "Edit Menu Product" : "Add New Menu Product"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-ash hover:text-cream">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ash">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Signature Cold Brew"
                    className="w-full px-3 py-2 bg-midnight border border-midnight-line rounded-lg text-sm text-cream focus:outline-none focus:border-bronze"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-ash">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-midnight border border-midnight-line rounded-lg text-sm text-cream focus:outline-none focus:border-bronze"
                    >
                      <option value="Coffee">Coffee</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Mains">Mains</option>
                      <option value="Dessert">Dessert</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-ash">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-midnight border border-midnight-line rounded-lg text-sm text-cream focus:outline-none focus:border-bronze"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-ash">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-midnight border border-midnight-line rounded-lg text-sm text-cream focus:outline-none focus:border-bronze"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="rounded bg-midnight border-midnight-line text-bronze focus:ring-0"
                  />
                  <label htmlFor="available" className="text-xs text-cream select-none cursor-pointer">
                    Available for customer & staff ordering
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-midnight-line">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-ash">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="bg-bronze hover:bg-bronze-glow text-midnight font-bold">
                    Save Product
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
