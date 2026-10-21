import React from "react";
import { BackButton } from "@/components/ui/BackButton";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="light" />
        </div>

        <h1 className="font-display text-3xl font-bold text-midnight">
          Terms of Club Membership & Play
        </h1>
        <p className="text-xs text-ash">Effective Date: October 2026 · Bengaluru, India</p>

        <div className="bg-cream-card p-8 rounded-2xl border border-black/10 shadow-sm space-y-6 text-sm text-ash leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-midnight">
              1. Parlour Etiquette & Equipment Care
            </h2>
            <p>
              Players are required to treat tournament tables, Strachan baize, and custom house cues with utmost care. Jump shots that gouge the slate or deliberate baize scratching will incur full replacement recovery charges.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-midnight">
              2. Slot Check-in & No-Show Grace Period
            </h2>
            <p>
              Booked tables are reserved for the exact slot window selected. Customers must check in with their 6-digit PIN within 15 minutes of slot start time. After 15 minutes without contact, the table is released to walk-in players.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-midnight">
              3. Billing & Payments
            </h2>
            <p>
              All table time and table-side café food orders are aggregated into a single combined bill upon session conclusion. Payments are accepted via Cash, UPI, and major Debit/Credit Cards.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
