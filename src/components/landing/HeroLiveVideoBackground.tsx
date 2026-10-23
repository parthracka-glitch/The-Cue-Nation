"use client";

import React, { useEffect, useRef } from "react";

export function HeroLiveVideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating atmospheric dust motes in the lamp light beam
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate dust motes / light particles
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.6 + 0.2,
      targetAlpha: Math.random() * 0.7 + 0.2,
      vx: (Math.random() - 0.45) * 0.35,
      vy: -(Math.random() * 0.45 + 0.2), // gentle upward drift through light
      glow: Math.random() > 0.4,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Alpha breathing
        p.alpha += (p.targetAlpha - p.alpha) * 0.02;
        if (Math.abs(p.alpha - p.targetAlpha) < 0.05) {
          p.targetAlpha = Math.random() * 0.7 + 0.15;
        }

        // Draw particle with warm golden tint
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(246, 215, 141, ${p.alpha})`;
        ctx.fill();

        if (p.glow) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(233, 185, 79, ${p.alpha * 0.3})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* 1. Cinematic Steadycam Drifting & Breathing Background Image */}
      <div className="absolute -inset-6 w-[calc(100%+3rem)] h-[calc(100%+3rem)] overflow-hidden">
        <img
          src="/images/landing/hero-bg-hd.jpg"
          alt="QNation Luxury Billiards Lounge"
          className="w-full h-full object-cover object-center animate-hero-video-drift will-change-transform"
        />
      </div>

      {/* 2. Targeted Backlit QNation Neon Wall Sign Glow (Top-Right Brick Wall) */}
      <div
        className="absolute top-[8%] right-[2%] w-[52%] h-[44%] rounded-full opacity-70 animate-neon-sign-pulse mix-blend-screen pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(233, 185, 79, 0.45) 0%, rgba(212, 160, 48, 0.20) 42%, transparent 75%)",
        }}
      />

      {/* 3. Overhead Brass Lamps Light Cones & Felt Illumination (Center to Right) */}
      <div
        className="absolute top-[6%] left-[32%] w-[48%] h-[68%] rounded-full opacity-65 animate-overhead-lamp-shimmer mix-blend-screen pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 32%, rgba(255, 230, 165, 0.38) 0%, rgba(233, 185, 79, 0.18) 42%, rgba(10, 85, 81, 0.16) 68%, transparent 85%)",
        }}
      />

      {/* 4. Green Baize Table Felt Ambient Shimmer (Foreground Brunswick Pool Table) */}
      <div
        className="absolute bottom-[2%] left-[26%] w-[68%] h-[50%] rounded-full opacity-50 animate-felt-shimmer mix-blend-color-dodge pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 55% 65%, rgba(47, 163, 154, 0.32) 0%, rgba(10, 85, 81, 0.20) 48%, transparent 75%)",
        }}
      />

      {/* 5. Atmospheric Floating Dust Motes & Micro-Glow Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-75 mix-blend-screen pointer-events-none"
      />

      {/* 6. Subtle Filmic Scanlines / Cinema Grain Effect */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.1) 50%, rgba(0, 0, 0, 0.1) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* 7. Cinema Lens Edge Vignette (Pure smooth deep fade) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 55% 45%, transparent 50%, rgba(3, 18, 15, 0.6) 80%, rgba(3, 18, 15, 0.95) 100%)",
        }}
      />

      {/* 8. Controlled Dark Gradient Overlays for High-Contrast Readable UI */}
      {/* Left heavy gradient: keeps headlines & buttons razor sharp and legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#03120F] via-[#03120F]/90 via-42% to-transparent" />
      {/* Top navbar transition gradient */}
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#03120F] via-[#03120F]/60 to-transparent" />
      {/* Bottom section transition gradient */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#03120F] via-[#03120F]/80 to-transparent" />
    </div>
  );
}
