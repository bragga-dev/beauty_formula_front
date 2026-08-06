import { useState } from "react";
import { CheckCircle2, MessageSquareText, RotateCcw, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { RatingStars } from "@/components/ui/RatingStars";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useModerationRatings, useRatingModerationMutations } from "@/hooks/useRatings";
import { useTeam } from "@/hooks/useTeam";
import { useAuth } from "@/app/providers/auth-context";
import { useToast } from "@/app/providers/toast-context";
import type { AdminRatingFilters, AverageRatingPrivateOut, RatingValue } from "@/types/rating";
import type { ApiError } from "@/types/common";

const AUTH_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "published", label: "Publicadas" },
];

function isAuthorizedFromFilter(value: string): boolean | undefined {
  if (value === "pending") return false;
  if (value === "published") return true;
  return undefined;
}

function clientName(rating: AverageRatingPrivateOut): string {
  return [rating.client.first_name, rating.client.last_name].filter(Boolean).join(" ") || "Cliente";
}

function employeeName(rating: AverageRatingPrivateOut): string {
  return [rating.employee.first_name, rating.employee.last_name].filter(Boolean).join(" ") || "Funcionário";
}

export function DashboardRatingsPage() {
  const { me } = useAuth();
  const isAdmin = me?.user.role === "admin";
  const { push } = useToast();

  const [authFilter, setAuthFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState<RatingValue | "">("");
  const [employeeId, setEmployeeId] = useState("");
  const [page, setPage] = useState(1);

  const filters: AdminRatingFilters = {
    isAuthorized: isAuthorizedFromFilter(authFilter),
    rating: ratingFilter || undefined,
    employeeId: isAdmin ? employeeId || undefined : undefined,
  };

  const { data, isLoading, isError, refetch } = useModerationRatings(filters, page);
  const { authorize, revoke, remove } = useRatingModerationMutations();
  const { data: team } = useTeam(1, 100);

  const [revoking, setRevoking] = useState<AverageRatingPrivateOut | null>(null);
  const [deleting, setDeleting] = useState<AverageRatingPrivateOut | null>(null);

  function updateFilters<K extends "auth" | "rating" | "employee">(
    key: K,
    value: K extends "auth" ? string : K extends "rating" ? RatingValue | "" : string,
  ) {
    if (key === "auth") setAuthFilter(value as string);
    if (key === "rating") setRatingFilter(value as RatingValue | "");
    if (key === "employee") setEmployeeId(value as string);
    setPage(1);
  }

  async function handleAuthorize(rating: AverageRatingPrivateOut) {
    try {
      await authorize.mutateAsync(rating.id);
      push("Avaliação publicada.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleRevoke() {
    if (!revoking) return;
    try {
      await revoke.mutateAsync(revoking.id);
      push("Publicação revogada.", "success");
      setRevoking(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      push("Avaliação excluída.", "success");
      setDeleting(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const columns: Column<AverageRatingPrivateOut>[] = [
    { header: "Cliente", cell: (r) => <span className="font-medium text-bone-50">{clientName(r)}</span> },
    ...(isAdmin ? [{ header: "Funcionário", cell: (r: AverageRatingPrivateOut) => employeeName(r), hideOnMobile: true }] : []),
    { header: "Serviço", cell: (r) => r.service.name, hideOnMobile: true },
    { header: "Nota", cell: (r) => <RatingStars value={r.rating} size="xs" showValue={false} /> },
    {
      header: "Comentário",
      cell: (r) => (
        <span className="line-clamp-1 max-w-xs text-bone-400">{r.comment || "—"}</span>
      ),
      hideOnMobile: true,
    },
    {
      header: "Status",
      cell: (r) => (
        <Badge variant={r.is_authorized ? "success" : "neutral"}>
          {r.is_authorized ? "Publicada" : "Pendente"}
        </Badge>
      ),
    },
    {
      header: "Ações",
      cell: (r) => (
        <div className="flex justify-end gap-1">
          {!r.is_authorized && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Publicar"
              onClick={() => handleAuthorize(r)}
              disabled={authorize.isPending}
            >
              <CheckCircle2 className="h-4 w-4 text-success-500" />
            </Button>
          )}
          {isAdmin && r.is_authorized && (
            <Button variant="ghost" size="icon" aria-label="Revogar" onClick={() => setRevoking(r)}>
              <RotateCcw className="h-4 w-4 text-bone-400" />
            </Button>
          )}
          {isAdmin && (
            <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => setDeleting(r)}>
              <Trash2 className="h-4 w-4 text-danger-500" />
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div>
      <div>
        <h1 className="text-3xl">Avaliações</h1>
        <p className="mt-1 text-bone-500">
          {isAdmin
            ? "Autorize ou revogue a publicação de qualquer avaliação recebida."
            : "Autorize a publicação das avaliações que você recebeu dos clientes."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {AUTH_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => updateFilters("auth", f.value)}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
              authFilter === f.value
                ? "border-crimson-500 bg-crimson-500 text-bone-50"
                : "border-ink-700 text-bone-400 hover:border-gold-400 hover:text-gold-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={`mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        <Select
          aria-label="Nota"
          value={ratingFilter}
          onChange={(e) => updateFilters("rating", (e.target.value ? (Number(e.target.value) as RatingValue) : ""))}
        >
          <option value="">Todas as notas</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "estrela" : "estrelas"}
            </option>
          ))}
        </Select>

        {isAdmin && (
          <Select aria-label="Funcionário" value={employeeId} onChange={(e) => updateFilters("employee", e.target.value)}>
            <option value="">Todos os funcionários</option>
            {team?.items.map((e) => (
              <option key={e.id} value={e.id}>
                {[e.first_name, e.last_name].filter(Boolean).join(" ") || "Sem nome"}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="mt-6">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="Nenhuma avaliação encontrada"
            description="Não há avaliações para os filtros selecionados."
          />
        ) : (
          <>
            <DataTable columns={columns} rows={data?.items ?? []} rowKey={(r) => r.id} isLoading={isLoading} />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!revoking}
        title="Revogar publicação"
        description={`Isso remove a avaliação de ${revoking ? clientName(revoking) : ""} da exibição pública. Ela pode ser publicada de novo depois.`}
        confirmLabel="Revogar"
        variant="danger"
        isLoading={revoke.isPending}
        onConfirm={handleRevoke}
        onCancel={() => setRevoking(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir avaliação"
        description={`Tem certeza que deseja excluir permanentemente a avaliação de ${deleting ? clientName(deleting) : ""}? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}