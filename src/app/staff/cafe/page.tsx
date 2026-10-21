"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StaffNav } from "@/components/staff/StaffNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { venueStore } from "@/lib/store/venueStore";
import { Order, OrderStatus, MenuItem, GameTable } from "@/types/database";
import { formatTimeIST } from "@/lib/time";
import {
  Coffee,
  Plus,
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Utensils,
  Receipt,
  User,
} from "lucide-react";
import clsx from "clsx";

export default function StaffCafePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<GameTable[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // New order modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadData = () => {
    setOrders(venueStore.getOrders());
    setMenu(venueStore.getMenu());
    setTables(venueStore.getTables());
  };

  useEffect(() => {
    reloadData();
    const unsub = venueStore.subscribe(reloadData);
    return unsub;
  }, []);

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    venueStore.updateOrderStatus(orderId, status);
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[itemId] > 1) {
        copy[itemId] -= 1;
      } else {
        delete copy[itemId];
      }
      return copy;
    });
  };

  const calculateCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, qty]) => {
      const item = menu.find((m) => m.id === itemId);
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handleSubmitOrder = () => {
    const itemIds = Object.keys(cart);
    if (itemIds.length === 0) return;

    setIsSubmitting(true);
    // For each item in cart, submit to venueStore
    itemIds.forEach((itemId) => {
      const qty = cart[itemId];
      const item = menu.find((m) => m.id === itemId);
      if (item) {
        for (let i = 0; i < qty; i++) {
          venueStore.createOrder({
            table_id: selectedTableId || "walk-in-cafe",
            menu_item_id: item.id,
            status: "new",
          });
        }
      }
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCart({});
      setOrderNotes("");
      setIsOrderModalOpen(false);
      reloadData();
    }, 400);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (searchQuery) {
      const item = menu.find((m) => m.id === o.menu_item_id);
      const tableName = tables.find((t) => t.id === o.table_id)?.name || "Walk-In";
      const q = searchQuery.toLowerCase();
      return item?.name.toLowerCase().includes(q) || tableName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <StaffNav />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-bronze">
              Floor Operations POS
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
              Café & Order Queue
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={reloadData}
              className="text-ash border-midnight-line hover:text-cream"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOrderModalOpen(true)}
              className="bg-bronze hover:bg-bronze-glow text-midnight font-bold shadow-md shadow-bronze/20"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Café Order
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Orders" },
              { id: "new", label: "New (Pending)" },
              { id: "preparing", label: "Preparing" },
              { id: "ready", label: "Ready to Serve" },
              { id: "served", label: "Served / Fulfilled" },
              { id: "cancelled", label: "Cancelled" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                  filterStatus === f.id
                    ? "bg-bronze text-midnight border-bronze font-bold"
                    : "bg-midnight-card border-midnight-line text-ash hover:text-cream"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table or item..."
              className="w-full pl-9 pr-3 py-1.5 bg-midnight-card border border-midnight-line rounded-lg text-xs text-cream placeholder-ash/50 focus:outline-none focus:border-bronze"
            />
          </div>
        </div>

        {/* Order Queue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-16 text-center text-ash bg-midnight-card/50 rounded-xl border border-midnight-line">
              <ChefHat className="w-10 h-10 mx-auto text-ash/40 mb-2" />
              <p className="text-sm font-semibold">No orders in this queue status</p>
              <p className="text-xs text-ash/60 mt-1">New café orders will appear here automatically.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const item = menu.find((m) => m.id === order.menu_item_id);
              const table = tables.find((t) => t.id === order.table_id);
              return (
                <Card
                  key={order.id}
                  variant="dark"
                  className={clsx(
                    "p-5 flex flex-col justify-between border-midnight-line space-y-4 transition-all",
                    order.status === "new" && "border-amber/50 bg-amber/5",
                    order.status === "preparing" && "border-sky-500/40 bg-sky-500/5",
                    order.status === "ready" && "border-emerald-500/50 bg-emerald-500/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-baize-light block">
                        {table ? table.name : "Walk-in Customer"}
                      </span>
                      <h3 className="font-display text-base font-bold text-cream mt-0.5">
                        {item ? item.name : "Café Item"}
                      </h3>
                      <span className="text-xs text-bronze font-bold">₹{item ? item.price : 0}</span>
                    </div>
                    <span
                      className={clsx(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                        order.status === "new" && "bg-amber/10 border-amber/30 text-amber",
                        order.status === "preparing" && "bg-sky-500/10 border-sky-500/30 text-sky-400",
                        order.status === "ready" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                        order.status === "served" && "bg-white/5 border-white/20 text-ash",
                        order.status === "cancelled" && "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      )}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-ash flex items-center justify-between pt-2 border-t border-midnight-line/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-ash/70" />
                      {formatTimeIST(order.created_at)}
                    </span>
                    <span className="text-ash/60">ID: #{order.id.slice(-6)}</span>
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {order.status === "new" && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(order.id, "preparing")}
                        className="w-full text-xs py-1.5 bg-sky-600 hover:bg-sky-500 text-white"
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(order.id, "ready")}
                        className="w-full text-xs py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                      >
                        Mark as Ready
                      </Button>
                    )}
                    {order.status === "ready" && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(order.id, "served")}
                        className="w-full text-xs py-1.5 bg-bronze hover:bg-bronze-glow text-midnight font-bold"
                      >
                        Confirm Served
                      </Button>
                    )}
                    {order.status !== "served" && order.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpdateStatus(order.id, "cancelled")}
                        className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* New Order Modal */}
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-midnight-card border border-midnight-line rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-midnight-line">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-bronze" />
                  <h3 className="font-display text-lg font-bold text-cream">Create New Café Order</h3>
                </div>
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className="text-ash hover:text-cream text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Table Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ash">
                  Assign to Table or Walk-in
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-3 py-2 bg-midnight border border-midnight-line rounded-lg text-sm text-cream focus:outline-none focus:border-bronze"
                >
                  <option value="">Walk-In Café Customer (Stand-alone bill)</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status === "running" ? "Active Session" : t.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Items Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-ash">
                  Select Menu Items
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {menu.map((item) => {
                    const count = cart[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className={clsx(
                          "p-3 rounded-xl border flex items-center justify-between transition-all",
                          count > 0
                            ? "bg-bronze/10 border-bronze text-cream"
                            : "bg-midnight border-midnight-line text-ash hover:border-bronze/40"
                        )}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-semibold text-xs text-cream truncate">{item.name}</div>
                          <div className="text-[11px] text-bronze font-bold">₹{item.price}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {count > 0 && (
                            <>
                              <button
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="w-6 h-6 rounded bg-midnight-line text-cream flex items-center justify-center font-bold text-xs hover:bg-rose-500/20"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold px-1">{count}</span>
                            </>
                          )}
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-6 h-6 rounded bg-bronze text-midnight flex items-center justify-center font-bold text-xs hover:bg-bronze-glow"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary & Submit */}
              <div className="pt-4 border-t border-midnight-line space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ash font-medium">Estimated Order Subtotal:</span>
                  <span className="text-lg font-bold text-bronze-glow">₹{calculateCartTotal()}</span>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setIsOrderModalOpen(false)}
                    className="text-ash hover:text-cream"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={Object.keys(cart).length === 0 || isSubmitting}
                    onClick={handleSubmitOrder}
                    className="bg-bronze hover:bg-bronze-glow text-midnight font-bold"
                  >
                    {isSubmitting ? "Submitting..." : "Send to Kitchen & Add to Bill"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
