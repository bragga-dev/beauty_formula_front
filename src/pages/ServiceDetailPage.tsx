import { useParams, useNavigate } from "react-router-dom";
import { Clock, ArrowLeft, CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui/RatingStars";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ReviewList } from "@/features/ratings/ReviewList";
import { useServiceDetail } from "@/hooks/useServices";
import { useServiceRatingSummary, useServiceRatings } from "@/hooks/useRatings";
import { formatCurrencyBRL, formatDuration } from "@/utils/format";
import { ROUTES } from "@/constants/routes";

export function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { data: service, isLoading, isError, refetch } = useServiceDetail(serviceId);
  const { data: ratingSummary } = useServiceRatingSummary(serviceId);
  const { data: ratingsPage, isLoading: isLoadingRatings } = useServiceRatings(serviceId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="mt-6 h-8 w-1/2" />
        <Skeleton className="mt-3 h-4 w-full" />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState message="Não foi possível carregar este serviço." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(ROUTES.services)}
        className="mb-6 flex items-center gap-1.5 text-sm text-bone-500 hover:text-bone-100"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para serviços
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-card border border-ink-700 bg-ink-800">
          <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" />
        </div>

        <div>
          <h1 className="text-3xl">{service.name}</h1>
          <RatingStars
            value={ratingSummary?.average_rating ?? 0}
            totalReviews={ratingSummary?.total_reviews}
            size="md"
            className="mt-2"
          />
          <div className="mt-4 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm text-bone-400">
              <Clock className="h-4 w-4" /> {formatDuration(service.duration_minutes)}
            </span>
            <span className="font-display text-2xl text-crimson-400">{formatCurrencyBRL(service.price)}</span>
          </div>
          {service.description && <p className="mt-6 text-bone-400">{service.description}</p>}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to={`${ROUTES.booking}?service=${service.id}`} size="lg">
              <CalendarClock className="h-4 w-4" /> Agendar este serviço
            </ButtonLink>
            <Button variant="outline" size="lg" onClick={() => navigate(ROUTES.team)}>
              Ver profissionais
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Avaliações</h2>
          <RatingStars
            value={ratingSummary?.average_rating ?? 0}
            totalReviews={ratingSummary?.total_reviews}
            size="sm"
          />
        </div>
        <div className="mt-5">
          <ReviewList ratings={ratingsPage?.items} isLoading={isLoadingRatings} emptySubject="este serviço" />
        </div>
      </div>
    </div>
  );
}