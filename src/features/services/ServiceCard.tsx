import { Link } from "react-router-dom";
import { Clock, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/ui/RatingStars";
import { ROUTES } from "@/constants/routes";
import { formatCurrencyBRL, formatDuration } from "@/utils/format";
import { useServiceRatingSummary } from "@/hooks/useRatings";
import type { ServiceOut } from "@/types/service";

export function ServiceCard({ service }: { service: ServiceOut }) {
  const { data: summary } = useServiceRatingSummary(service.id);

  return (
    <Link to={ROUTES.serviceDetail(service.id)}>
      <Card className="group h-full overflow-hidden transition-all hover:border-gold-400/50 hover:shadow-elevated">
        <div className="aspect-[4/3] overflow-hidden bg-ink-700">
          <img
            src={service.image_url}
            alt={service.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base uppercase tracking-wide text-bone-50">{service.name}</h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-gold-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          {service.description && (
            <p className="mt-2 line-clamp-2 text-sm text-bone-500">{service.description}</p>
          )}
          <RatingStars
            value={summary?.average_rating ?? 0}
            totalReviews={summary?.total_reviews}
            size="xs"
            className="mt-3"
          />
          <div className="mt-4 flex items-center justify-between border-t border-ink-700 pt-4">
            <span className="flex items-center gap-1.5 text-xs text-bone-500">
              <Clock className="h-3.5 w-3.5" /> {formatDuration(service.duration_minutes)}
            </span>
            <span className="font-display text-lg text-crimson-400">{formatCurrencyBRL(service.price)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}