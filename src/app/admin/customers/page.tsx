"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { venueStore } from "@/lib/store/venueStore";
import { Booking } from "@/types/database";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatDateIST, formatTimeIST } from "@/lib/time";
import {
  Users,
  Search,
  Calendar,
  CreditCard,
  Eye,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface CustomerProfile {
  key: string;
  name: string;
  phone: string;
  email?: string;
  totalBookings: number;
  totalSpend: number;
  bookings: Booking[];
}

export default function AdminCustomersPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const reload = () => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (data.bookings) setBookings(data.bookings);
      })
      .catch(() => {
        setBookings(venueStore.getBookings());
      });
  };

  useEffect(() => {
    reload();
  }, []);

  // Group bookings by customer phone or name
  const customerMap = new Map<string, CustomerProfile>();

  bookings.forEach((b) => {
    const key = (b.guest_phone || b.guest_name || "Guest").trim().toLowerCase();
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        key,
        name: b.guest_name || "Player",
        phone: b.guest_phone || "—",
        email: b.user_id ? "registered@cuenation.club" : undefined,
        totalBookings: 1,
        totalSpend: b.amount,
        bookings: [b],
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.totalBookings += 1;
      existing.totalSpend += b.amount;
      existing.bookings.push(b);
    }
  });

  const customerList = Array.from(customerMap.values()).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <Users className="w-3.5 h-3.5" />
                Customer Relationship & Lifetime Value
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Customer Intelligence Directory
              </h1>
            </div>

            <div className="text-xs text-mist font-semibold">
              Total Customer Profiles: <strong className="text-cream">{customerList.length}</strong>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-midnight-card p-4 rounded-2xl border border-midnight-line shadow-md max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by player name or mobile..."
                className="w-full bg-midnight border border-midnight-line rounded-xl pl-9 pr-4 py-2 text-xs text-cream placeholder-mist/40 focus:outline-none focus:ring-1 focus:ring-bronze-glow"
              />
              <Search className="w-4 h-4 text-mist absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-midnight-card border border-midnight-line rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight/70 text-mist uppercase font-mono tracking-wider border-b border-midnight-line">
                  <tr>
                    <th className="py-3.5 px-4">Player Name</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Total Reservations</th>
                    <th className="py-3.5 px-4">Lifetime Spend</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-midnight-line text-cream">
                  {customerList.map((cust) => (
                    <tr key={cust.key} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-cream">
                        {cust.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-mist">
                        {cust.phone}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-cream">
                        {cust.totalBookings}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-bronze-glow">
                        ₹{cust.totalSpend.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCustomer(cust)}
                          className="text-xs text-mist hover:text-cream gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View History ({cust.bookings.length})
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Booking History Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Booking History"
      >
        {selectedCustomer && (
          <div className="space-y-4 text-left">
            <div className="p-3 bg-midnight-card border border-midnight-line rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-mist">Player:</span>
                <span className="font-bold text-cream">{selectedCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist">Phone:</span>
                <span className="font-mono text-cream">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mist">Lifetime Spend:</span>
                <span className="font-mono font-bold text-bronze-glow">₹{selectedCustomer.totalSpend}</span>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedCustomer.bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-midnight border border-midnight-line flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-cream">{b.booking_code}</span>
                    <div className="text-[11px] text-mist mt-0.5">₹{b.amount} · {b.source}</div>
                  </div>
                  <StatusBadge status={b.status} isDark />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
