import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-crimson-500 text-bone-50 hover:bg-crimson-400 active:bg-crimson-600 shadow-lg shadow-crimson-500/20",
  secondary: "bg-ink-700 text-bone-50 hover:bg-ink-600 border border-ink-600",
  outline: "border border-bone-500/40 text-bone-100 hover:border-gold-400 hover:text-gold-400",
  ghost: "text-bone-300 hover:text-bone-50 hover:bg-ink-800",
  danger: "bg-danger-500 text-bone-50 hover:bg-danger-500/90",
  gold: "bg-gold-400 text-ink-950 hover:bg-gold-300 font-semibold",
};

const SIZE_STYLES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
  icon: "h-10 w-10 shrink-0",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-card font-display text-sm uppercase tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none",
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    fullWidth && "w-full",
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, fullWidth, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={buttonClasses({ variant, size, fullWidth, className })}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
