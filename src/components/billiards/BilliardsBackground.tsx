"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function BilliardsBackground() {
  const pathname = usePathname();
  const [scrollY, setScrollY] = useState(0);

  // Portal routes (staff / admin / owner) have their own dark solid backgrounds
  const isPortalRoute =
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/owner");

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth parallax scroll offset (subtle upward shift as user scrolls down)
  const parallaxOffset = Math.min(scrollY * 0.18, 180);

  // Don't render decorative background on operational dashboards
  if (isPortalRoute) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Outer Parallax Scroll Container with extra bleed to prevent edge clipping */}
      <div
        className="absolute -top-16 -bottom-16 -left-12 -right-12 w-[calc(100%+96px)] h-[calc(100%+128px)] transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(0, ${-parallaxOffset}px, 0)`,
          willChange: "transform",
        }}
      >
        {/* Animated Ambient Drift Layer featuring the WhatsApp custom background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-ambient-drift"
          style={{
            backgroundImage: "url('/images/venue-background.jpg')",
            opacity: 0.52,
          }}
        />
      </div>

      {/* Atmospheric Luxury Felt Deep Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070909]/85 via-[#070909]/60 to-[#070909]/92" />

      {/* Radial Vignette: keeps center vivid while dark edges enhance typography contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(10, 85, 81, 0.20) 0%, rgba(7, 9, 9, 0.68) 65%, #070909 100%)",
        }}
      />

      {/* Pulsing Warm Brass Overhead Lamp Glow Simulation */}
      <div
        className="absolute top-0 left-1/2 w-[850px] h-[420px] rounded-full blur-[130px] pointer-events-none animate-lamp-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(197, 160, 89, 0.40) 0%, rgba(10, 85, 81, 0.15) 55%, transparent 75%)",
        }}
      />
    </div>
  );
}

