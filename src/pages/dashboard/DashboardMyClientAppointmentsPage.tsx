import { useState } from "react";
import { CalendarClock, CheckCircle2, Eye, UserX, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/tables/Pagination";
import { useEmployeeSchedulings, useEmployeeSchedulingMutations } from "@/hooks/useScheduling";
import { CancelAppointmentModal } from "@/features/appointments/CancelAppointmentModal";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate, formatTime } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import {
  SCHEDULING_STATUS_LABELS,
  SCHEDULING_STATUS_BADGE,
  canEmployeeActOnScheduling,
  getSchedulingEndTime,
  type SchedulingFilter,
  type SchedulingOut,
} from "@/types/scheduling.types";
import type { ApiError } from "@/types/common";

const FILTERS: { value: SchedulingFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "confirmed", label: SCHEDULING_STATUS_LABELS.confirmed },
  { value: "completed", label: SCHEDULING_STATUS_LABELS.completed },
  { value: "canceled", label: SCHEDULING_STATUS_LABELS.canceled },
  { value: "no_show", label: SCHEDULING_STATUS_LABELS.no_show },
  { value: "rescheduled", label: SCHEDULING_STATUS_LABELS.rescheduled },
];

function clientName(scheduling: SchedulingOut): string {
  return [scheduling.client.first_name, scheduling.client.last_name].filter(Boolean).join(" ") || "Cliente";
}

export function DashboardMyClientAppointmentsPage() {
  const [filter, setFilter] = useState<SchedulingFilter>("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useEmployeeSchedulings(filter, page);
  const { complete, markNoShow, cancel } = useEmployeeSchedulingMutations();
  const { push } = useToast();

  const [completing, setCompleting] = useState<SchedulingOut | null>(null);
  const [markingNoShow, setMarkingNoShow] = useState<SchedulingOut | null>(null);
  const [cancelling, setCancelling] = useState<SchedulingOut | null>(null);

  function handleFilterChange(value: SchedulingFilter) {
    setFilter(value);
    setPage(1);
  }

  async function handleComplete() {
    if (!completing) return;
    try {
      await complete.mutateAsync(completing.id);
      push("Atendimento concluído.", "success");
      setCompleting(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleNoShow() {
    if (!markingNoShow) return;
    try {
      await markNoShow.mutateAsync(markingNoShow.id);
      push("Agendamento marcado como não comparecido.", "success");
      setMarkingNoShow(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleCancel(reason: string) {
    if (!cancelling) return;
    try {
      await cancel.mutateAsync({ id: cancelling.id, payload: { reason } });
      push("Agendamento cancelado.", "success");
      setCancelling(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl">Meus Atendimentos</h1>
        <p className="mt-1 text-bone-500">
          Acompanhe os agendamentos dos seus clientes e atualize o status conforme atende.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
              filter === f.value
                ? "border-crimson-500 bg-crimson-500 text-bone-50"
                : "border-ink-700 text-bone-400 hover:border-gold-400 hover:text-gold-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nenhum agendamento encontrado"
            description="Não há atendimentos para o filtro selecionado."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data?.items.map((scheduling) => (
              <Card key={scheduling.id} className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base uppercase tracking-wide text-bone-50">
                      {scheduling.service.name}
                    </p>
                    <p className="mt-1 text-sm text-bone-500">cliente: {clientName(scheduling)}</p>
                  </div>
                  <Badge variant={SCHEDULING_STATUS_BADGE[scheduling.status]}>
                    {SCHEDULING_STATUS_LABELS[scheduling.status]}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-bone-300">
                  <span>{formatDate(scheduling.scheduled_time)}</span>
                  <span>
                    {formatTime(scheduling.scheduled_time)} – {formatTime(getSchedulingEndTime(scheduling))}
                  </span>
                  <span className="text-gold-400">{formatCurrencyBRL(scheduling.price_at_booking)}</span>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-ink-700 pt-4">
                  {canEmployeeActOnScheduling(scheduling) && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setCompleting(scheduling)}>
                        <CheckCircle2 className="h-4 w-4 text-success-500" /> Concluir
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setMarkingNoShow(scheduling)}>
                        <UserX className="h-4 w-4 text-bone-400" /> Não compareceu
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCancelling(scheduling)}>
                        <XCircle className="h-4 w-4 text-danger-500" /> Cancelar
                      </Button>
                    </>
                  )}
                  <ButtonLink to={ROUTES.dashboardClientAppointmentDetail(scheduling.id)} variant="outline" size="sm">
                    <Eye className="h-4 w-4" /> Ver detalhes
                  </ButtonLink>
                </div>
              </Card>
            ))}
          </div>
        )}

        {data && (
          <div className="mt-4">
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!completing}
        title="Concluir atendimento"
        description={`Confirma que o atendimento de "${completing?.service.name}" para ${completing ? clientName(completing) : ""} foi concluído?`}
        confirmLabel="Concluir"
        isLoading={complete.isPending}
        onConfirm={handleComplete}
        onCancel={() => setCompleting(null)}
      />

      <ConfirmDialog
        open={!!markingNoShow}
        title="Marcar não comparecimento"
        description={`Confirma que ${markingNoShow ? clientName(markingNoShow) : "o cliente"} não compareceu a esse agendamento?`}
        confirmLabel="Marcar não compareceu"
        variant="danger"
        isLoading={markNoShow.isPending}
        onConfirm={handleNoShow}
        onCancel={() => setMarkingNoShow(null)}
      />

      <CancelAppointmentModal
        open={!!cancelling}
        serviceName={cancelling?.service.name}
        isLoading={cancel.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelling(null)}
      />
    </div>
  );
}