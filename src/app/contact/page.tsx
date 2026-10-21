"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Send,
  CheckCircle2,
} from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-cream-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Navigation */}
        <div>
          <BackButton fallbackHref="/" label="Back to Home" variant="light" />
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-baize/10 text-baize font-semibold text-xs tracking-wider uppercase">
            <MapPin className="w-3.5 h-3.5" />
            Parlour Concierge
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-midnight tracking-tight">
            Visit the Parlour
          </h1>
          <p className="text-ash text-base sm:text-lg leading-relaxed">
            Located in the heart of Koramangala, Bengaluru. Step inside for tournament baize, bespoke espresso, and a
            refined club atmosphere.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Details & Hours */}
          <div className="space-y-6">
            <Card className="bg-white rounded-3xl p-8 border-black/10 shadow-card space-y-6">
              <h3 className="font-display text-2xl font-bold text-midnight">
                Venue Location & Hours
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-bronze shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-midnight">Address</div>
                    <div className="text-ash leading-relaxed mt-0.5">
                      80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-t border-black/5 pt-4">
                  <Clock className="w-5 h-5 text-baize shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-midnight">Operating Hours</div>
                    <div className="text-ash mt-0.5">
                      Monday to Sunday: <span className="font-mono font-semibold text-midnight">10:00 AM — 01:00 AM</span>
                    </div>
                    <div className="text-xs text-ash/80 mt-0.5">
                      Late-night café & racks available daily.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-t border-black/5 pt-4">
                  <Phone className="w-5 h-5 text-bronze shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-midnight">Direct Concierge</div>
                    <div className="text-ash font-mono mt-0.5">+91 80 4123 4567</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 border-t border-black/5 pt-4">
                  <Mail className="w-5 h-5 text-baize shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-midnight">Email Enquiries</div>
                    <div className="text-ash mt-0.5">concierge@cuenation.club</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Club Etiquette Card */}
            <div className="bg-midnight rounded-3xl p-8 text-cream border border-midnight-line space-y-4">
              <h4 className="font-display text-xl font-bold text-bronze-glow">
                Parlour Etiquette & House Rules
              </h4>
              <ul className="text-xs sm:text-sm text-mist space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-baize-light shrink-0" />
                  No drinks or food allowed on the wooden table rails or baize.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-baize-light shrink-0" />
                  Please use designated cue rests for masse or jump shots.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-baize-light shrink-0" />
                  Smart casual attire. Dedicated indoor cues and custom cases welcome.
                </li>
              </ul>
            </div>
          </div>

          {/* Contact & Enquiry Form */}
          <Card className="bg-white rounded-3xl p-8 border-black/10 shadow-card flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-midnight">
                  Send a Concierge Note
                </h3>
                <p className="text-sm text-ash mt-1">
                  Private bookings, tournament hosting, and group reservations.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 text-center space-y-3 bg-baize/5 rounded-2xl border border-baize/20">
                  <CheckCircle2 className="w-12 h-12 text-baize mx-auto" />
                  <h4 className="font-display text-xl font-bold text-midnight">
                    Message Received
                  </h4>
                  <p className="text-sm text-ash">
                    Thank you. Our floor concierge will be in touch shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ash mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Parth Racka"
                      className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ash mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. parth@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ash mb-1">
                      Enquiry / Event Details
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your requirements, date, and group size..."
                      className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-bronze"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    Submit Concierge Request
                  </Button>
                </form>
              )}
            </div>

            <div className="pt-6 border-t border-black/5 text-xs text-ash text-center mt-6">
              Valet parking available for all reserved cueists at the front gate.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
