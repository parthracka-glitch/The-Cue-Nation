import type { Metadata, Viewport } from "next";
import { playfair, inter } from "@/app/fonts";
import "@/app/globals.css";
import { AuthProvider } from "@/lib/store/authContext";
import { RoleSwitcherBar } from "@/components/navigation/RoleSwitcherBar";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { BilliardsBackground } from "@/components/billiards/BilliardsBackground";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070909" },
    { media: "(prefers-color-scheme: light)", color: "#F6EFDF" },
  ],
};

export const metadata: Metadata = {
  title: "Cue Nation — Parlour & Lounge | Own the Table",
  description:
    "A premier billiards & snooker parlour with championship tables, artisanal specialty roastery café, and instant live-sync table bookings in Koramangala, Bengaluru.",
  keywords: [
    "Cue Nation",
    "Pool parlour Bengaluru",
    "Snooker booking",
    "Billiards lounge",
    "Koramangala pool table",
    "Specialty coffee lounge",
  ],
  authors: [{ name: "Cue Nation Concierge" }],
  openGraph: {
    title: "Cue Nation — Parlour & Lounge",
    description: "Championship tables. Serious coffee. Zero friction live booking.",
    url: "https://cuenation.club",
    siteName: "Cue Nation",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased selection:bg-brass selection:text-ink">
        <AuthProvider>
          {/* Layer 0: High-Resolution Top-Down Atmospheric Billiards Background */}
          <BilliardsBackground />

          {/* Layer 10: Interactive Stacking Content Context */}
          <div className="relative z-10 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
