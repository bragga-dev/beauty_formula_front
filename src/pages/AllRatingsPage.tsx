import { useSearchParams } from "react-router-dom";
import { MessageSquareText } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/tables/Pagination";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useAllPublicRatings } from "@/hooks/useRatings";
import { usePublicServices } from "@/hooks/useServices";
import { useTeam } from "@/hooks/useTeam";
import { formatDate, initials } from "@/utils/format";
import type { RatingValue } from "@/types/rating";

function RatingsPageSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-card border border-ink-700 bg-ink-800/60 p-5">
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

export function AllRatingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const serviceId = searchParams.get("service") ?? "";
  const employeeId = searchParams.get("employee") ?? "";
  const ratingParam = searchParams.get("rating");
  const rating = ratingParam ? (Number(ratingParam) as RatingValue) : undefined;
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isLoading, isError, refetch } = useAllPublicRatings({ serviceId, employeeId, rating }, page);
  const { data: services } = usePublicServices(1, 100);
  const { data: team } = useTeam(1, 100);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  }

  function updatePage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl">Todas as Avaliações</h1>
        <p className="mt-2 text-bone-500">
          O que nossos clientes têm dito sobre os serviços e o atendimento da Fórmula da Beleza.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select aria-label="Serviço" value={serviceId} onChange={(e) => updateParam("service", e.target.value)}>
          <option value="">Todos os serviços</option>
          {services?.items.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select aria-label="Profissional" value={employeeId} onChange={(e) => updateParam("employee", e.target.value)}>
          <option value="">Todos os profissionais</option>
          {team?.items.map((e) => (
            <option key={e.id} value={e.id}>
              {[e.first_name, e.last_name].filter(Boolean).join(" ") || "Sem nome"}
            </option>
          ))}
        </Select>

        <Select aria-label="Nota" value={ratingParam ?? ""} onChange={(e) => updateParam("rating", e.target.value)}>
          <option value="">Todas as notas</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "estrela" : "estrelas"}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <RatingsPageSkeleton />
        ) : isError ? (
          <ErrorState message="Não foi possível carregar as avaliações." onRetry={() => refetch()} />
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="Nenhuma avaliação encontrada"
            description="Não há avaliações publicadas para os filtros selecionados."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {data?.items.map((review) => {
                const clientName =
                  [review.client.first_name, review.client.last_name].filter(Boolean).join(" ") || "Cliente";
                const employeeName =
                  [review.employee.first_name, review.employee.last_name].filter(Boolean).join(" ") ||
                  "Profissional";
                return (
                  <div key={review.id} className="rounded-card border border-ink-700 bg-ink-800/60 p-5">
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

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-ink-700 px-2.5 py-1 text-bone-400">{review.service.name}</span>
                      <span className="rounded-full bg-ink-700 px-2.5 py-1 text-bone-400">{employeeName}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {data && (
              <div className="mt-8">
                <Pagination page={data.page} pages={data.pages} onChange={updatePage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}