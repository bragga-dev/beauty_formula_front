import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Variant = "neutral" | "success" | "danger" | "gold" | "crimson" | "info" | "purple" | "orange";

const STYLES: Record<Variant, string> = {
  neutral: "bg-ink-700 text-bone-300",
  success: "bg-success-500/15 text-success-500",
  danger: "bg-danger-500/15 text-danger-500",
  gold: "bg-gold-400/15 text-gold-400",
  crimson: "bg-crimson-500/15 text-crimson-400",
  info: "bg-info-500/15 text-info-500",
  purple: "bg-purple-500/20 text-purple-400",
  orange: "bg-orange-500/15 text-orange-500",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
        STYLES[variant],
        className,
      )}
      {...props}
    />
  );
}