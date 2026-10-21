import React from "react";
import { BackButton } from "@/components/ui/BackButton";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="light" />
        </div>

        <h1 className="font-display text-3xl font-bold text-midnight">
          Privacy Policy (India DPDP Act Compliant)
        </h1>
        <p className="text-xs text-ash">Effective Date: October 2026 · Digital Personal Data Protection Compliance</p>

        <div className="bg-cream-card p-8 rounded-2xl border border-black/10 shadow-sm space-y-6 text-sm text-ash leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-midnight">
              1. Information We Collect
            </h2>
            <p>
              We collect your name, phone number, and email strictly for processing table bookings, sending confidential check-in PINs, and providing electronic tax receipts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-midnight">
              2. Zero Public PII Disclosure
            </h2>
            <p>
              Public real-time availability broadcasts contain zero personally identifiable information (PII). Only anonymous table IDs and slot ranges are broadcast over WebSockets.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-midnight">
              3. Data Rights & Deletion Contact
            </h2>
            <p>
              In accordance with the India DPDP Act, you retain full rights to request access, correction, or deletion of your user profile and booking history by contacting concierge@cuenation.club.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
