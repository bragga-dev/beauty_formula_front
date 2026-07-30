import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-ink-600 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-800 text-gold-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-display uppercase tracking-wide text-bone-50">{title}</h3>
      {description && <p className="max-w-sm text-sm text-bone-500">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
