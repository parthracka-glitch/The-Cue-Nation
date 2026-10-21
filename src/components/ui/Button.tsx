import React from "react";
import clsx from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "primary-dark" | "secondary" | "secondary-dark" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-9 min-h-[36px] px-3.5 text-xs rounded-lg gap-1.5 touch-manipulation",
      md: "h-11 min-h-[44px] px-5 text-sm rounded-xl gap-2 touch-manipulation",
      lg: "h-13 min-h-[48px] px-7 text-base rounded-2xl gap-2.5 font-semibold touch-manipulation",
    };

    const variantClasses = {
      // Primary on light/cream base: Bronze bg + Cream text
      primary:
        "bg-bronze text-cream hover:bg-bronze-dark active:scale-[0.98] shadow-sm hover:shadow transition-all duration-150 focus-visible:ring-2 focus-visible:ring-baize focus-visible:ring-offset-2",
      // Primary on dark/teal base: Lamp Glow bg + Midnight text
      "primary-dark":
        "bg-bronze-glow text-midnight font-semibold hover:bg-bronze-glowdark active:scale-[0.98] shadow-lamp transition-all duration-150 focus-visible:ring-2 focus-visible:ring-bronze-glow focus-visible:ring-offset-2",
      // Secondary on light: Baize outline + Baize text
      secondary:
        "border-[1.5px] border-baize text-baize hover:bg-baize/10 active:scale-[0.98] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-baize",
      // Secondary on dark: Lamp Glow outline + Lamp Glow text
      "secondary-dark":
        "border-[1.5px] border-bronze-glow text-bronze-glow hover:bg-bronze-glow/10 active:scale-[0.98] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-bronze-glow",
      // Danger: Cue Red
      danger:
        "bg-cue text-cream hover:bg-[#8A2431] active:scale-[0.98] shadow-sm transition-all duration-150 focus-visible:ring-2 focus-visible:ring-cue",
      ghost:
        "text-foreground hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all duration-150",
      outline:
        "border border-current opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all duration-150",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          "inline-flex items-center justify-center font-medium transition-colors select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
