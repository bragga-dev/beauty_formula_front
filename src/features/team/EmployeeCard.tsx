import { Link } from "react-router-dom";
import { RatingStars } from "@/components/ui/RatingStars";
import { ROUTES } from "@/constants/routes";
import { initials } from "@/utils/format";
import { useEmployeeRatingSummary } from "@/hooks/useRatings";
import type { EmployeeTeamOut } from "@/types/employee";

export function EmployeeCard({ employee }: { employee: EmployeeTeamOut }) {
  const name = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Profissional";
  const { data: summary } = useEmployeeRatingSummary(employee.id);
  return (
    <Link
      to={ROUTES.teamDetail(employee.id)}
      className="group block overflow-hidden rounded-card border border-ink-700 bg-ink-800/70 transition-all hover:border-gold-400/50"
    >
      <div className="aspect-square overflow-hidden bg-ink-700">
        {employee.photo_url ? (
          <img
            src={employee.photo_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-4xl text-gold-400">
            {initials(employee.first_name, employee.last_name)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-sm uppercase tracking-wide text-bone-50">{name}</h3>
        <RatingStars
          value={summary?.average_rating ?? 0}
          totalReviews={summary?.total_reviews}
          size="xs"
          className="mt-1.5"
        />
      </div>
    </Link>
  );
}