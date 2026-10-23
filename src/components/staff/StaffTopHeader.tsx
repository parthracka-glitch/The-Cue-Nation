"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/store/authContext";
import { Bell, ChevronDown, User, Menu } from "lucide-react";

interface StaffTopHeaderProps {
  onToggleMobileMenu?: () => void;
  notificationCount?: number;
}

export function StaffTopHeader({
  onToggleMobileMenu,
  notificationCount = 3,
}: StaffTopHeaderProps) {
  const { user } = useAuth();
  const [currentDateStr, setCurrentDateStr] = useState<string>("Thu, 24 Apr 2025");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("10:24 AM");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: "Thu, 24 Apr 2025"
      const dateFormatted = now.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      // Format: "10:24 AM"
      const timeFormatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setCurrentDateStr(dateFormatted);
      setCurrentTimeStr(timeFormatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const displayName = user ? user.name.split(" ")[0] : "Staff";
  const fullName = user ? user.name : "Rahul Sharma";

  return (
    <header className="bg-[#06251F] text-white border-b border-[#0D3830] px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
      {/* Left Greeting */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
            {getGreeting()}, {displayName}!
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-300">
            Here&apos;s what&apos;s happening at QNation today.
          </p>
        </div>
      </div>

      {/* Right User & Clock Area */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notification Bell */}
        <div className="relative cursor-pointer p-1.5 rounded-full hover:bg-white/10 transition-colors">
          <Bell className="w-5 h-5 text-neutral-300" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#E53E3E] text-white text-[9.5px] font-bold rounded-full flex items-center justify-center border border-[#06251F]">
              {notificationCount}
            </span>
          )}
        </div>

        {/* User Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#0F4037]">
          <div className="w-8 h-8 rounded-full bg-[#E9B94F]/20 border border-[#E9B94F]/50 flex items-center justify-center text-[#E9B94F] font-bold text-xs flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-bold text-white">{fullName}</div>
            <div className="text-[10px] text-neutral-400 capitalize">
              {user ? user.role : "Staff"}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
        </div>

        {/* Current Date & Live Clock */}
        <div className="hidden md:flex flex-col text-right pl-3 border-l border-[#0F4037] leading-tight">
          <span className="text-[11px] text-neutral-300 font-medium">
            {currentDateStr}
          </span>
          <span className="text-xs font-bold text-[#E9B94F] font-mono mt-0.5">
            {currentTimeStr}
          </span>
        </div>
      </div>
    </header>
  );
}
