import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-bone-500">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "h-11 w-full appearance-none rounded-card border border-ink-600 bg-ink-800 px-4 pr-10 text-sm text-bone-50 transition-colors focus-visible:border-gold-400 focus-visible:outline-none",
              error && "border-danger-500",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-500" />
        </div>
        {error && <p className="text-xs text-danger-500">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";
