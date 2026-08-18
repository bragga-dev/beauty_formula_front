import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { RatingStars } from "@/components/ui/RatingStars";
import type { RatingBreakdownItem } from "@/types/rating";

interface RatingBreakdownProps {
  averageRating: number | string;
  totalReviews: number;
  breakdown: RatingBreakdownItem[];
  /** Se informado, mostra o link "Consulte todas as avaliações" apontando pra cá. */
  seeAllLink?: string;
  className?: string;
}

/**
 * Resumo de avaliações em estrelas + distribuição por nota — nota média
 * grande, total de avaliações e uma barra por nota (5★ → 1★) com
 * percentual, no estilo do resumo de avaliações da Amazon.
 */
export function RatingBreakdown({ averageRating, totalReviews, breakdown, seeAllLink, className }: RatingBreakdownProps) {
  const hasReviews = totalReviews > 0;

  return (
    <div className={className}>
      <div className="flex items-baseline gap-2">
        <RatingStars value={averageRating} totalReviews={totalReviews} size="lg" showValue={false} />
        {hasReviews && (
          <span className="font-display text-xl text-bone-50">
            {Number(averageRating).toFixed(1)} <span className="text-sm font-normal text-bone-500">de 5</span>
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-bone-500">
        {hasReviews
          ? totalReviews === 1
            ? "1 avaliação no total"
            : `${totalReviews} avaliações no total`
          : "Ainda sem avaliações"}
      </p>

      {hasReviews && (
        <div className="mt-4 space-y-2">
          {breakdown.map((item) => (
            <div key={item.rating} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-bone-400">
                {item.rating} estrela{item.rating === 1 ? "" : "s"}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-700">
                <div className="h-full rounded-full bg-gold-400" style={{ width: `${item.percentage}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-bone-500">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}

      {hasReviews && seeAllLink && (
        <Link
          to={seeAllLink}
          className="mt-4 inline-flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300"
        >
          Consulte todas as avaliações <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}