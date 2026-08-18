import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface MetaItem {
  label: string;
  value: ReactNode;
}

interface MobileRowCardProps {
  /** Avatar, thumbnail ou ícone à esquerda do título */
  media?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Badges de status/role, exibidos à direita do título */
  badges?: ReactNode;
  /** Pares label/valor (preço, duração, data, etc.) */
  meta?: MetaItem[];
  /** Botões de ação, alinhados à direita no rodapé do card */
  actions?: ReactNode;
}

export function MobileRowCard({ media, title, subtitle, badges, meta, actions }: MobileRowCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {media}
          <div className="min-w-0">
            <p className="truncate font-medium text-bone-50">{title}</p>
            {subtitle && <p className="truncate text-xs text-bone-600">{subtitle}</p>}
          </div>
        </div>
        {badges && <div className="flex shrink-0 flex-wrap justify-end gap-1.5">{badges}</div>}
      </div>

      {meta && meta.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-ink-700 pt-3 text-xs">
          {meta.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2">
              <dt className="text-bone-600">{item.label}</dt>
              <dd className="truncate text-bone-200">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {actions && (
        <div className="mt-3 flex justify-end gap-1 border-t border-ink-700 pt-3">{actions}</div>
      )}
    </Card>
  );
}