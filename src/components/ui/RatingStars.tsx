import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

const STAR_SIZE: Record<"xs" | "sm" | "md" | "lg", string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const TEXT_SIZE: Record<"xs" | "sm" | "md" | "lg", string> = {
  xs: "text-[11px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

interface RatingStarsProps {
  /** Nota média de 0 a 5 (aceita fração, ex: 4.3). */
  value: number | string;
  /** Total de avaliações usadas no cálculo — exibido entre parênteses. */
  totalReviews?: number;
  size?: "xs" | "sm" | "md" | "lg";
  /** Mostra a nota numérica ao lado das estrelas. Padrão: true. */
  showValue?: boolean;
  className?: string;
}

/**
 * Exibe a média de avaliações em estrelas douradas (preenchimento
 * fracionário via overlay recortado), seguindo a mesma identidade visual
 * do seletor de estrelas do modal de avaliação (`gold-400` / `ink-600`).
 *
 * Quando não há avaliações ainda (`totalReviews === 0` ou ausente),
 * mostra as estrelas vazias com um texto neutro no lugar da nota.
 */
export function RatingStars({ value, totalReviews, size = "sm", showValue = true, className }: RatingStarsProps) {
  const numericValue = typeof value === "string" ? Number(value) : value;
  const hasReviews = typeof totalReviews === "number" ? totalReviews > 0 : numericValue > 0;
  const clamped = Math.max(0, Math.min(5, hasReviews ? numericValue : 0));
  const fillPercent = (clamped / 5) * 100;
  const starClass = STAR_SIZE[size];

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="relative inline-flex shrink-0">
        <div className="flex gap-0.5 text-ink-600">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={starClass} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-gold-400"
          style={{ width: `${fillPercent}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(starClass, "fill-gold-400")} />
          ))}
        </div>
      </div>

      {showValue && (
        <span className={cn(TEXT_SIZE[size], "text-bone-400")}>
          {hasReviews ? (
            <>
              <span className="font-medium text-bone-100">{clamped.toFixed(1)}</span>
              {typeof totalReviews === "number" && <span className="text-bone-600"> ({totalReviews})</span>}
            </>
          ) : (
            <span className="text-bone-600">Sem avaliações</span>
          )}
        </span>
      )}
    </div>
  );
}