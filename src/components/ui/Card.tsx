import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "teal";
}

export function Card({
  className,
  variant = "light",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    light: "bg-cream-card text-midnight border border-black/5 shadow-card",
    dark: "bg-midnight-card text-cream border border-midnight-line shadow-card",
    teal: "bg-baize-dark text-cream border border-baize/30 shadow-card felt-texture",
  };

  return (
    <div
      className={clsx(
        "rounded-2xl p-6 transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
