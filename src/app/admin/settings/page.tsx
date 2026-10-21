"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { VenueSettings } from "@/types/database";
import { Button } from "@/components/ui/Button";
import {
  Settings,
  Save,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<VenueSettings>({
    venue_name: "Cue Nation Parlour & Lounge",
    tagline: "Own the Table",
    address: "80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
    phone: "+91 80 4123 4567",
    email: "concierge@cuenation.club",
    opening_time: "10:00",
    closing_time: "01:00",
    max_booking_days_ahead: 7,
    slot_duration_minutes: 60,
    cancellation_deadline_hours: 2,
    tax_percentage: 5,
    pool_hourly_rate: 350,
    snooker_hourly_rate: 500,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin",
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-cream flex flex-col">
      <AdminNav />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-midnight-line">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bronze-glow">
                <Settings className="w-3.5 h-3.5" />
                Venue Operating Policies & Configuration
              </div>
              <h1 className="font-display text-3xl font-bold text-cream mt-1">
                Venue Settings & Hours
              </h1>
            </div>

            {saveSuccess && (
              <span className="text-xs font-bold text-baize-light flex items-center gap-1.5 bg-baize/20 px-3 py-1.5 rounded-full border border-baize/30">
                <CheckCircle2 className="w-4 h-4" /> Policy settings saved
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Identity Card */}
            <div className="bg-midnight-card border border-midnight-line rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="font-display text-xl font-bold text-cream">
                Club Identity & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                    Venue Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.venue_name}
                    onChange={(e) => setSettings({ ...settings, venue_name: e.target.value })}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                    Brand Tagline:
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                    Physical Address:
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                    Concierge Phone:
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                    Official Email:
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                  />
                </div>
              </div>
            </div>

            {/* Hours & Booking Policy Card */}
            <div className="bg-midnight-card border border-midnight-line rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="font-display text-xl font-bold text-cream">
                Operating Schedule & Booking Limits
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                    Opening Time (Daily):
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.opening_time}
                    onChange={(e) => setSettings({ ...settings, opening_time: e.target.value })}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                    Closing Time (Late Night):
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.closing_time}
                    onChange={(e) => setSettings({ ...settings, closing_time: e.target.value })}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                    Max Days in Advance for Bookings:
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    value={settings.max_booking_days_ahead}
                    onChange={(e) => setSettings({ ...settings, max_booking_days_ahead: Number(e.target.value) })}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist mb-1">
                    Free Cancellation Window (Hours Before Slot):
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={48}
                    value={settings.cancellation_deadline_hours}
                    onChange={(e) => setSettings({ ...settings, cancellation_deadline_hours: Number(e.target.value) })}
                    className="w-full bg-midnight border border-midnight-line rounded-xl px-3 py-2 text-sm text-cream font-mono focus:outline-none focus:ring-1 focus:ring-bronze-glow"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary-dark"
                size="lg"
                type="submit"
                disabled={isSaving}
                className="gap-2 font-bold bg-bronze hover:bg-bronze-dark text-white shadow-lamp"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving Venue Settings..." : "Save Venue Configuration"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
