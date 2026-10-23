import React from "react";

interface TableTopIllustrationProps {
  type: "pool" | "snooker";
  className?: string;
}

export function TableTopIllustration({ type, className = "w-16 h-10" }: TableTopIllustrationProps) {
  const isSnooker = type === "snooker";

  return (
    <div className={`relative flex items-center justify-center ${className} select-none flex-shrink-0`}>
      <svg
        viewBox="0 0 100 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Outer Wooden Rails */}
        <rect x="2" y="2" width="96" height="58" rx="6" fill="#3D2314" stroke="#5C381E" strokeWidth="2" />

        {/* Brass Corner Caps */}
        <rect x="2" y="2" width="10" height="10" rx="3" fill="#D4AF37" />
        <rect x="88" y="2" width="10" height="10" rx="3" fill="#D4AF37" />
        <rect x="2" y="50" width="10" height="10" rx="3" fill="#D4AF37" />
        <rect x="88" y="50" width="10" height="10" rx="3" fill="#D4AF37" />

        {/* Center Pocket Caps */}
        <rect x="46" y="2" width="8" height="6" rx="1.5" fill="#C5A059" />
        <rect x="46" y="54" width="8" height="6" rx="1.5" fill="#C5A059" />

        {/* Green Baize Playing Surface */}
        <rect
          x="8"
          y="8"
          width="84"
          height="46"
          rx="3"
          fill={isSnooker ? "#0E5B3D" : "#13724D"}
        />

        {/* Subtle Cushion Shadow */}
        <rect x="8" y="8" width="84" height="46" rx="3" stroke="#083D28" strokeWidth="1.5" />

        {/* Corner & Side Pockets (Black) */}
        <circle cx="10" cy="10" r="3" fill="#111111" />
        <circle cx="90" cy="10" r="3" fill="#111111" />
        <circle cx="10" cy="52" r="3" fill="#111111" />
        <circle cx="90" cy="52" r="3" fill="#111111" />
        <circle cx="50" cy="8" r="2.8" fill="#111111" />
        <circle cx="50" cy="54" r="2.8" fill="#111111" />

        {/* Ball arrangements */}
        {isSnooker ? (
          /* Snooker: Triangle of Red Balls + Black Ball + Cue Ball */
          <>
            {/* The 'D' line & Baulk */}
            <line x1="28" y1="8" x2="28" y2="54" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            <path
              d="M 28 23 A 8 8 0 0 0 28 39"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.8"
            />
            {/* Triangle Cluster of Reds */}
            <g transform="translate(64, 31)">
              <circle cx="-6" cy="0" r="2" fill="#D12B2B" />
              <circle cx="-3" cy="-2.5" r="2" fill="#D12B2B" />
              <circle cx="-3" cy="2.5" r="2" fill="#D12B2B" />
              <circle cx="0" cy="-5" r="2" fill="#D12B2B" />
              <circle cx="0" cy="0" r="2" fill="#D12B2B" />
              <circle cx="0" cy="5" r="2" fill="#D12B2B" />
              <circle cx="3" cy="-2.5" r="2" fill="#D12B2B" />
              <circle cx="3" cy="2.5" r="2" fill="#D12B2B" />
              <circle cx="6" cy="0" r="2" fill="#D12B2B" />
            </g>
            {/* Black Ball on Spot */}
            <circle cx="78" cy="31" r="2.2" fill="#111111" stroke="#333" strokeWidth="0.4" />
            {/* Cue Ball in 'D' */}
            <circle cx="26" cy="29" r="2.2" fill="#FBFBFB" />
          </>
        ) : (
          /* Pool: Cue Stick resting across + Scattered Pool Balls */
          <>
            {/* Pool Cue Stick */}
            <line
              x1="22"
              y1="40"
              x2="78"
              y2="18"
              stroke="#E2A665"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <line
              x1="74"
              y1="19.5"
              x2="78"
              y2="18"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* 8-Ball */}
            <circle cx="48" cy="31" r="2.5" fill="#111111" />
            <circle cx="48" cy="31" r="0.9" fill="#FFFFFF" />
            {/* Solid & Striped Pool Balls */}
            <circle cx="42" cy="28" r="2.4" fill="#F1C40F" />
            <circle cx="53" cy="28" r="2.4" fill="#E74C3C" />
            <circle cx="45" cy="35" r="2.4" fill="#3498DB" />
            <circle cx="54" cy="34" r="2.4" fill="#E67E22" />
            {/* Cue Ball */}
            <circle cx="25" cy="24" r="2.5" fill="#FFFFFF" />
          </>
        )}
      </svg>
    </div>
  );
}
