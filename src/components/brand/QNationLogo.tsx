import React from "react";
import Link from "next/link";
import clsx from "clsx";

interface QNationLogoProps {
  className?: string;
  theme?: "light" | "dark";
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function QNationLogo({
  className,
  theme = "dark",
  href = "/",
  size = "md",
}: QNationLogoProps) {
  const isDark = theme === "dark";

  const sizeClasses = {
    sm: {
      crown: "w-4 h-3 -mb-1",
      q: "text-2xl",
      nation: "text-lg",
      sub: "text-[7.5px] tracking-[0.24em]",
    },
    md: {
      crown: "w-5 h-4 -mb-1",
      q: "text-3xl",
      nation: "text-xl",
      sub: "text-[8.5px] tracking-[0.26em]",
    },
    lg: {
      crown: "w-7 h-5 -mb-1.5",
      q: "text-4xl",
      nation: "text-2xl",
      sub: "text-[10px] tracking-[0.3em]",
    },
  }[size];

  const logoContent = (
    <div className={clsx("flex flex-col select-none group", className)}>
      <div className="flex items-center gap-1 leading-none">
        {/* Q with Crown atop */}
        <div className="relative inline-flex flex-col items-center">
          {/* Gold Crown SVG matching reference */}
          <svg
            viewBox="0 0 24 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={clsx("transition-transform group-hover:scale-110", sizeClasses.crown)}
          >
            <path
              d="M2 13.5L3.5 3.5L8.5 7.5L12 1.5L15.5 7.5L20.5 3.5L22 13.5H2Z"
              fill="#E9B94F"
            />
            <circle cx="3.5" cy="3.5" r="1.5" fill="#F6D78D" />
            <circle cx="12" cy="1.5" r="1.5" fill="#F6D78D" />
            <circle cx="20.5" cy="3.5" r="1.5" fill="#F6D78D" />
            <rect x="2" y="13.5" width="20" height="2" rx="1" fill="#E9B94F" />
          </svg>
          <span
            className={clsx(
              "font-display font-extrabold text-[#E9B94F] leading-none tracking-tight",
              sizeClasses.q
            )}
            style={{ textShadow: "0 2px 8px rgba(233, 185, 79, 0.25)" }}
          >
            Q
          </span>
        </div>

        {/* NATION */}
        <span
          className={clsx(
            "font-sans font-black tracking-[0.08em] leading-none uppercase pt-2",
            isDark ? "text-white" : "text-[#111C1B]",
            sizeClasses.nation
          )}
        >
          NATION
        </span>
      </div>

      {/* POOL & SNOOKER CLUB subtitle */}
      <span
        className={clsx(
          "font-sans font-semibold uppercase mt-0.5",
          isDark ? "text-neutral-300" : "text-neutral-700",
          sizeClasses.sub
        )}
      >
        POOL & SNOOKER CLUB
      </span>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B94F] rounded-lg"
      aria-label="QNation Home"
    >
      {logoContent}
    </Link>
  ) : (
    logoContent
  );
}
