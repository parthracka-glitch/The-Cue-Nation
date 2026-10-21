"use client";

import React, { useEffect } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  isDark?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  isDark = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-midnight/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          "relative w-full max-h-[90dvh] overflow-y-auto rounded-2xl shadow-2xl p-5 sm:p-7 z-10 transition-all border animate-in fade-in zoom-in-95 duration-200",
          maxWidthMap[maxWidth],
          isDark
            ? "bg-midnight-card text-cream border-midnight-line"
            : "bg-cream-card text-midnight border-black/10"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="font-display text-xl font-bold tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p
                className={clsx(
                  "text-sm mt-1",
                  isDark ? "text-mist" : "text-ash"
                )}
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className={clsx(
              "p-1.5 rounded-xl transition-colors cursor-pointer",
              isDark
                ? "text-mist hover:text-cream hover:bg-midnight-line"
                : "text-ash hover:text-midnight hover:bg-black/5"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
