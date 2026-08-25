import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 overflow-x-auto rounded-card border border-ink-700 bg-ink-800/60 p-1",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors",
              isActive
                ? "bg-gold-400 text-ink-900"
                : "text-bone-400 hover:bg-ink-700 hover:text-bone-100",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}