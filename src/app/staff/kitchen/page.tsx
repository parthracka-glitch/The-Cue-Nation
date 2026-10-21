"use client";

import React, { useState, useEffect } from "react";
import { venueStore } from "@/lib/store/venueStore";
import { Order, OrderStatus } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { formatTimeIST } from "@/lib/time";
import Link from "next/link";
import clsx from "clsx";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  Volume2,
} from "lucide-react";

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<"active" | "all">("active");

  const reload = () => {
    setOrders(venueStore.getOrders());
  };

  useEffect(() => {
    reload();
    const unsub = venueStore.subscribe(reload);
    return unsub;
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    venueStore.updateOrderStatus(orderId, newStatus);
  };

  const getTableName = (tableId: string) => {
    return venueStore.getTable(tableId)?.name || "Table";
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "active") {
      return o.status === "new" || o.status === "preparing";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-midnight text-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top KDS Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-midnight-line">
          <div className="flex items-center gap-4">
            <Link href="/staff">
              <Button
                variant="ghost"
                size="sm"
                className="text-mist hover:text-cream border border-midnight-line"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Floor Grid
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-bronze-glow" />
                <span className="text-xs uppercase tracking-widest font-bold text-mist">
                  KITCHEN & ROASTERY DISPLAY SYSTEM (KDS)
                </span>
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Live Ticket Queue
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-midnight-card border border-midnight-line p-1">
              <button
                onClick={() => setStatusFilter("active")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  statusFilter === "active"
                    ? "bg-bronze-glow text-midnight"
                    : "text-mist hover:text-cream"
                )}
              >
                Active Kitchen Tickets
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  statusFilter === "all"
                    ? "bg-bronze-glow text-midnight"
                    : "text-mist hover:text-cream"
                )}
              >
                All Orders History
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={reload}
              className="text-mist hover:text-cream border border-midnight-line"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-24 space-y-3 bg-midnight-card rounded-2xl border border-midnight-line">
            <ChefHat className="w-12 h-12 text-mist/30 mx-auto" />
            <h2 className="font-display text-xl font-bold text-cream">
              All Tickets Cleared!
            </h2>
            <p className="text-xs text-mist">
              No active café or roastery orders in queue right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const isNew = order.status === "new";
              const isPreparing = order.status === "preparing";
              const isServed = order.status === "served";

              return (
                <div
                  key={order.id}
                  className={clsx(
                    "bg-midnight-card rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-card transition-all",
                    isNew
                      ? "border-amber/60 ring-1 ring-amber/40"
                      : isPreparing
                      ? "border-bronze-glow/50"
                      : "border-midnight-line opacity-75"
                  )}
                >
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between border-b border-midnight-line pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-mist">
                        TICKET #{order.id}
                      </span>
                      <h3 className="font-display text-lg font-bold text-cream mt-0.5">
                        {getTableName(order.table_id)}
                      </h3>
                    </div>

                    <span
                      className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        isNew
                          ? "bg-amber/20 text-amber animate-pulse"
                          : isPreparing
                          ? "bg-bronze-glow/20 text-bronze-glow"
                          : "bg-baize-light/20 text-baize-light"
                      )}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-2 py-2 flex-1">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm py-1 border-b border-midnight-line/40 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-midnight text-bronze-glow font-bold text-xs flex items-center justify-center border border-midnight-line tabular-nums">
                            {item.qty}×
                          </span>
                          <span className="font-medium text-cream">
                            {item.menu_item?.name || "Café Item"}
                          </span>
                        </div>
                        <span className="text-xs text-mist tabular-nums">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer & Actions */}
                  <div className="border-t border-midnight-line pt-3 flex items-center justify-between">
                    <span className="text-xs text-mist flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimeIST(order.created_at)}
                    </span>

                    <div className="flex items-center gap-2">
                      {isNew && (
                        <Button
                          variant="primary-dark"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, "preparing")}
                          className="text-xs font-bold"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {isPreparing && (
                        <Button
                          variant="secondary-dark"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, "served")}
                          className="text-xs font-bold bg-baize-light/10 text-baize-light border-baize-light/40 hover:bg-baize-light/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Served
                        </Button>
                      )}
                      {isServed && (
                        <span className="text-xs text-baize-light font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Served to table
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
