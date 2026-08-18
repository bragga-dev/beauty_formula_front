import { MessageSquareText } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDate, initials } from "@/utils/format";
import type { AverageRatingOut } from "@/types/rating";

interface ReviewListProps {
  ratings?: AverageRatingOut[];
  isLoading?: boolean;
  /** Rótulo do estado vazio, ex: "este serviço" ou "este profissional". */
  emptySubject?: string;
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-card border border-ink-700 bg-ink-800/60 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3.5 w-full" />
          <Skeleton className="mt-2 h-3.5 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function ReviewList({ ratings, isLoading, emptySubject = "aqui" }: ReviewListProps) {
  if (isLoading) return <ReviewListSkeleton />;

  if (!ratings || ratings.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title="Nenhuma avaliação ainda"
        description={`Ainda não há avaliações publicadas para ${emptySubject}.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((review) => {
        const clientName =
          [review.client.first_name, review.client.last_name].filter(Boolean).join(" ") || "Cliente";
        return (
          <div key={review.id} className="rounded-card border border-ink-700 bg-ink-800/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={review.client.photo_url}
                  alt={clientName}
                  fallback={initials(review.client.first_name, review.client.last_name)}
                  size="md"
                />
                <div>
                  <p className="font-display text-sm uppercase tracking-wide text-bone-50">{clientName}</p>
                  <p className="text-xs text-bone-600">{formatDate(review.created_at)}</p>
                </div>
              </div>
              <RatingStars value={review.rating} size="sm" showValue={false} />
            </div>
            {review.comment && <p className="mt-3 text-sm text-bone-400">{review.comment}</p>}
          </div>
        );
      })}
    </div>
  );
}