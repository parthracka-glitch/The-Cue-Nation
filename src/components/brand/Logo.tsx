import React from "react";
import Link from "next/link";
import clsx from "clsx";

interface LogoProps {
  className?: string;
  variant?: "horizontal" | "icon" | "stacked";
  theme?: "light" | "dark";
  href?: string;
}

export function Logo({
  className,
  variant = "horizontal",
  theme = "light",
  href = "/",
}: LogoProps) {
  const isDark = theme === "dark";

  if (variant === "icon") {
    const iconContent = (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("w-10 h-10 transition-transform hover:scale-105", className)}
      >
        <circle cx="24" cy="24" r="22" fill={isDark ? "#0D1716" : "#0A5551"} stroke={isDark ? "#B8925A" : "#6D5330"} strokeWidth="2.5" />
        {/* Crossed cue line */}
        <line x1="10" y1="38" x2="38" y2="10" stroke={isDark ? "#B8925A" : "#EDDFC2"} strokeWidth="3" strokeLinecap="round" />
        {/* Cue ball */}
        <circle cx="24" cy="24" r="8" fill={isDark ? "#B8925A" : "#EDDFC2"} />
        <circle cx="24" cy="24" r="2.5" fill="#010101" />
      </svg>
    );

    return href ? <Link href={href} aria-label="Cue Nation Home">{iconContent}</Link> : iconContent;
  }

  const content = (
    <div className={clsx("flex items-center gap-3 select-none group", className)}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 flex-shrink-0 transition-transform group-hover:rotate-12 duration-300"
      >
        <circle cx="18" cy="18" r="16" fill={isDark ? "#B8925A" : "#0A5551"} />
        <circle cx="18" cy="18" r="6" fill={isDark ? "#010101" : "#EDDFC2"} />
        <circle cx="18" cy="18" r="2" fill={isDark ? "#B8925A" : "#010101"} />
      </svg>
      <div className="flex flex-col">
        <span
          className={clsx(
            "font-display tracking-[0.14em] font-bold text-xl leading-none uppercase",
            isDark ? "text-cream" : "text-midnight"
          )}
        >
          CUE NATI
          <span className="inline-block relative">
            <span className={clsx(isDark ? "text-bronze-glow" : "text-bronze")}>O</span>
            <span className="absolute top-[35%] left-[35%] w-1.5 h-1.5 bg-midnight rounded-full" />
          </span>
          N
        </span>
        <span
          className={clsx(
            "text-[10px] tracking-[0.28em] font-medium uppercase mt-0.5",
            isDark ? "text-mist" : "text-ash"
          )}
        >
          PARLOUR & LOUNGE
        </span>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-baize rounded-lg">
      {content}
    </Link>
  ) : (
    content
  );
}
