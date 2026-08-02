import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

const STEPS = ["Serviço", "Profissional", "Data e Horário", "Confirmação"];

export function BookingSteps({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const isDone = step < current;
        const isActive = step === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-display",
                isDone && "border-gold-400 bg-gold-400 text-ink-950",
                isActive && "border-crimson-500 text-crimson-400",
                !isDone && !isActive && "border-ink-600 text-bone-600",
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : step}
            </span>
            <span className={cn("text-xs uppercase tracking-wide", isActive ? "text-bone-50" : "text-bone-600")}>
              {label}
            </span>
            {step < STEPS.length && <span className="mx-1 h-px w-6 bg-ink-700 sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}