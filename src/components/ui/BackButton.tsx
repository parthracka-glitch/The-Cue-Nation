"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";

export interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
  variant?: "dark" | "light" | "ghost" | "gold";
}

export function BackButton({
  fallbackHref = "/",
  label = "Back to Home",
  className,
  variant = "dark",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  const variantStyles = {
    dark: "bg-midnight/80 hover:bg-midnight border border-white/10 hover:border-brass/40 text-cream/90 hover:text-brass shadow-sm",
    light: "bg-white/80 hover:bg-white border border-black/10 hover:border-bronze/40 text-midnight/80 hover:text-midnight shadow-sm",
    ghost: "bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 text-mist hover:text-cream",
    gold: "bg-brass/10 hover:bg-brass/20 border border-brass/30 text-brass hover:text-brass-glow",
  };

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className={clsx(
        "group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer backdrop-blur-sm",
        variantStyles[variant],
        className
      )}
      aria-label={label}
    >
      <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1 text-brass" />
      <span>{label}</span>
    </Link>
  );
}
