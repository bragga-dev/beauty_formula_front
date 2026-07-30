import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-bone-500">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            "min-h-28 w-full resize-y rounded-card border border-ink-600 bg-ink-800 px-4 py-3 text-sm text-bone-50 placeholder:text-bone-600 transition-colors focus-visible:border-gold-400 focus-visible:outline-none",
            error && "border-danger-500",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-500">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
