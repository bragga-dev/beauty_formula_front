import { useState } from "react";
import { CalendarClock, Eye, Pencil, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/tables/Pagination";
import { useAdminSchedulings, useAdminSchedulingMutations } from "@/hooks/useScheduling";
import { CancelAppointmentModal } from "@/features/appointments/CancelAppointmentModal";
import { EditAppointmentModal } from "@/features/appointments/EditAppointmentModal";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate, formatTime } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import {
  SCHEDULING_STATUS_LABELS,
  SCHEDULING_STATUS_BADGE,
  canAdminModifySchedule,
  getSchedulingEndTime,
  type SchedulingFilter,
  type SchedulingOut,
  type SchedulingUpdateInput,
} from "@/types/scheduling.types";
import type { ApiError } from "@/types/common";

const FILTERS: { value: SchedulingFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "created", label: SCHEDULING_STATUS_LABELS.created },
  { value: "confirmed", label: SCHEDULING_STATUS_LABELS.confirmed },
  { value: "completed", label: SCHEDULING_STATUS_LABELS.completed },
  { value: "canceled", label: SCHEDULING_STATUS_LABELS.canceled },
  { value: "no_show", label: SCHEDULING_STATUS_LABELS.no_show },
  { value: "rescheduled", label: SCHEDULING_STATUS_LABELS.rescheduled },
];

export function DashboardAppointmentsPage() {
  const [filter, setFilter] = useState<SchedulingFilter>("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminSchedulings({ status: filter }, page);
  const { update, cancel } = useAdminSchedulingMutations();
  const { push } = useToast();

  const [editing, setEditing] = useState<SchedulingOut | null>(null);
  const [cancelling, setCancelling] = useState<SchedulingOut | null>(null);

  function handleFilterChange(value: SchedulingFilter) {
    setFilter(value);
    setPage(1);
  }

  async function handleEdit(payload: SchedulingUpdateInput) {
    if (!editing) return;
    try {
      await update.mutateAsync({ id: editing.id, payload });
      push("Agendamento atualizado.", "success");
      setEditing(null);
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
        <h1 className="text-3xl">Agendamentos</h1>
        <p className="mt-1 text-bone-500">Gerencie todos os horários marcados no salão.</p>
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
            description="Não há agendamentos para o filtro selecionado."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data?.items.map((scheduling: SchedulingOut) => {
              const clientName =
                [scheduling.client.first_name, scheduling.client.last_name].filter(Boolean).join(" ") ||
                "Cliente";
              const employeeName =
                [scheduling.employee.first_name, scheduling.employee.last_name].filter(Boolean).join(" ") ||
                "profissional";
              const editable = canAdminModifySchedule(scheduling);
              return (
                <Card key={scheduling.id} className="flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-base uppercase tracking-wide text-bone-50">
                        {scheduling.service.name}
                      </p>
                      <p className="mt-1 text-sm text-bone-500">
                        {clientName} com {employeeName}
                      </p>
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
                    {editable && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setCancelling(scheduling)}>
                          <XCircle className="h-4 w-4 text-danger-500" /> Cancelar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(scheduling)}>
                          <Pencil className="h-4 w-4 text-gold-400" /> Editar
                        </Button>
                      </>
                    )}
                    <ButtonLink to={ROUTES.dashboardAppointmentAdminDetail(scheduling.id)} variant="outline" size="sm">
                      <Eye className="h-4 w-4" /> Ver detalhes
                    </ButtonLink>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {data && (
          <div className="mt-4">
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </div>
        )}
      </div>

      <EditAppointmentModal
        open={!!editing}
        scheduling={editing}
        isSubmitting={update.isPending}
        onSubmit={handleEdit}
        onClose={() => setEditing(null)}
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