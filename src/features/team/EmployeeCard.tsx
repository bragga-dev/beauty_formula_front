import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/ui/RatingStars";
import { ROUTES } from "@/constants/routes";
import { initials } from "@/utils/format";
import { useEmployeeRatingSummary } from "@/hooks/useRatings";
import type { EmployeeTeamOut } from "@/types/employee";

export function EmployeeCard({ employee }: { employee: EmployeeTeamOut }) {
  const name = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Profissional";
  const { data: summary } = useEmployeeRatingSummary(employee.id);
  return (
    <Link to={ROUTES.teamDetail(employee.id)}>
      <Card className="group h-full overflow-hidden transition-all hover:border-gold-400/50 hover:shadow-elevated">
        <div className="aspect-[4/3] overflow-hidden bg-ink-700">
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
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base uppercase tracking-wide text-bone-50">{name}</h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-gold-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <RatingStars
            value={summary?.average_rating ?? 0}
            totalReviews={summary?.total_reviews}
            size="xs"
            className="mt-3"
          />
        </div>
      </Card>
    </Link>
  );
}