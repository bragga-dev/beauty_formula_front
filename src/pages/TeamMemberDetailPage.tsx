import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, AtSign, CalendarClock, Scissors, CalendarDays, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { RatingStars } from "@/components/ui/RatingStars";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Pagination } from "@/components/tables/Pagination";
import { RatingBreakdown } from "@/features/ratings/RatingBreakdown";
import { ReviewList } from "@/features/ratings/ReviewList";
import { PublicEmployeeCalendar } from "@/features/team/PublicEmployeeCalendar";
import { formatCurrencyBRL, formatDuration, initials } from "@/utils/format";
import { useTeamMember } from "@/hooks/useTeam";
import { useEmployeeRatingSummary, useEmployeeRatings } from "@/hooks/useRatings";
import { ROUTES } from "@/constants/routes";

type TabValue = "servicos" | "agenda" | "avaliacoes";

const TABS: TabItem[] = [
  { value: "servicos", label: "Serviços", icon: Scissors },
  { value: "agenda", label: "Agenda", icon: CalendarDays },
  { value: "avaliacoes", label: "Avaliações", icon: Star },
];

export function TeamMemberDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviewsPage, setReviewsPage] = useState(1);

  const activeTab: TabValue = (searchParams.get("aba") as TabValue) || "servicos";

  const { data: employee, isLoading, isError, refetch } = useTeamMember(employeeId);
  const { data: ratingSummary, isLoading: isLoadingRatingSummary } = useEmployeeRatingSummary(employeeId);
  const { data: reviews, isLoading: isLoadingReviews } = useEmployeeRatings(employeeId, reviewsPage, 6);

  function handleTabChange(tab: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("aba", tab);
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="h-40 w-40 rounded-full" />
        <Skeleton className="mt-6 h-8 w-1/3" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState message="Não foi possível carregar este profissional." onRetry={() => refetch()} />
      </div>
    );
  }

  const name = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Profissional";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(ROUTES.team)}
        className="mb-6 flex items-center gap-1.5 text-sm text-bone-500 hover:text-bone-100"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para o time
      </button>

      {/* Biografia — base comum a todas as abas */}
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-gold-400/50 bg-ink-700">
          {employee.photo_url ? (
            <img src={employee.photo_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-3xl text-gold-400">
              {initials(employee.first_name, employee.last_name)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl">{name}</h1>
          <RatingStars
            value={ratingSummary?.average_rating ?? 0}
            totalReviews={ratingSummary?.total_reviews}
            size="md"
            className="mt-2 justify-center sm:justify-start"
          />
          {employee.bio && <p className="mt-2 max-w-lg text-bone-400">{employee.bio}</p>}
          {employee.instagram && (
            <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold-400">
              <AtSign className="h-4 w-4" /> {employee.instagram}
            </span>
          )}
        </div>
      </div>

      <div className="mt-10">
        <Tabs items={TABS} value={activeTab} onChange={handleTabChange} />
      </div>

      {/* Aba: Serviços */}
      {activeTab === "servicos" && (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {employee.services.length === 0 && (
              <div className="sm:col-span-2">
                <EmptyState icon={Scissors} title="Nenhum serviço vinculado ainda" />
              </div>
            )}
            {employee.services.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-card border border-ink-700 bg-ink-800/60 p-4"
              >
                <div>
                  <p className="font-display text-sm uppercase tracking-wide text-bone-50">{link.service.name}</p>
                  <p className="text-xs text-bone-500">{formatDuration(link.service.duration_minutes)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-crimson-400">{formatCurrencyBRL(link.service.price)}</span>
                  <ButtonLink
                    to={`${ROUTES.booking}?service=${link.service_id}&employee=${employee.id}`}
                    size="sm"
                    variant="outline"
                  >
                    <CalendarClock className="h-3.5 w-3.5" /> Agendar
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba: Agenda */}
      {activeTab === "agenda" && employeeId && (
        <div className="mt-8">
          <PublicEmployeeCalendar employeeId={employeeId} />
        </div>
      )}

      {/* Aba: Avaliações */}
      {activeTab === "avaliacoes" && (
        <div className="mt-8">
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            <div className="rounded-card border border-ink-700 bg-ink-800/60 p-5 lg:sticky lg:top-24 lg:self-start">
              {isLoadingRatingSummary ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <RatingBreakdown
                  averageRating={ratingSummary?.average_rating ?? 0}
                  totalReviews={ratingSummary?.total_reviews ?? 0}
                  breakdown={ratingSummary?.breakdown ?? []}
                />
              )}
            </div>

            <div>
              <ReviewList ratings={reviews?.items} isLoading={isLoadingReviews} emptySubject="este profissional" />
              {reviews && reviews.pages > 1 && (
                <div className="mt-6">
                  <Pagination page={reviews.page} pages={reviews.pages} onChange={setReviewsPage} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}