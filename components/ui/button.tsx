import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "gold";
  size?: "default" | "sm" | "lg" | "icon" | "touch";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]";

    const variants = {
      default:
        "bg-primary text-primary-foreground shadow hover:bg-emerald-600 shadow-emerald-950/40",
      destructive:
        "bg-destructive text-destructive-foreground shadow-sm hover:bg-red-700",
      outline:
        "border border-border bg-card/60 hover:bg-secondary hover:text-foreground text-foreground",
      secondary:
        "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
      ghost: "hover:bg-secondary/60 hover:text-foreground text-muted-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      gold: "bg-amber-500 text-stone-950 font-semibold shadow hover:bg-amber-400 shadow-amber-950/30",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-lg px-8 text-base",
      icon: "h-10 w-10",
      touch: "h-12 min-w-[48px] px-5 text-base", // 48px tablet-optimized
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
