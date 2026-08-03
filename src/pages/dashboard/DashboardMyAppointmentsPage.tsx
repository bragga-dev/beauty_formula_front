import { useState } from "react";
import { CalendarClock, Eye, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/tables/Pagination";
import { useMyAppointments, useAppointmentMutations } from "@/hooks/useAppointments";
import { CancelAppointmentModal } from "@/features/appointments/CancelAppointmentModal";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate, formatTime } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_BADGE,
  canClientCancelAppointment,
  getAppointmentEndTime,
  type AppointmentFilter,
  type AppointmentOut,
} from "@/types/appointment";
import type { ApiError } from "@/types/common";

const FILTERS: { value: AppointmentFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "confirmed", label: APPOINTMENT_STATUS_LABELS.confirmed },
  { value: "completed", label: APPOINTMENT_STATUS_LABELS.completed },
  { value: "canceled", label: APPOINTMENT_STATUS_LABELS.canceled },
  { value: "no_show", label: APPOINTMENT_STATUS_LABELS.no_show },
  { value: "rescheduled", label: APPOINTMENT_STATUS_LABELS.rescheduled },
];

export function DashboardMyAppointmentsPage() {
  const [filter, setFilter] = useState<AppointmentFilter>("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useMyAppointments(filter, page);
  const { cancel } = useAppointmentMutations();
  const { push } = useToast();

  const [cancelling, setCancelling] = useState<AppointmentOut | null>(null);

  function handleFilterChange(value: AppointmentFilter) {
    setFilter(value);
    setPage(1);
  }

  async function handleCancel(reason: string) {
    if (!cancelling) return;
    try {
      await cancel.mutateAsync({ id: cancelling.id, reason });
      push("Agendamento cancelado.", "success");
      setCancelling(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl">Meus Agendamentos</h1>
        <p className="mt-1 text-bone-500">Acompanhe seus horários marcados, concluídos e cancelados.</p>
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
            actionLabel="Agendar horário"
            onAction={() => (window.location.href = ROUTES.booking)}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data?.items.map((appointment: AppointmentOut) => (
              <Card key={appointment.id} className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base uppercase tracking-wide text-bone-50">
                      {appointment.service.name}
                    </p>
                    <p className="mt-1 text-sm text-bone-500">
                      com{" "}
                      {[appointment.employee.first_name, appointment.employee.last_name]
                        .filter(Boolean)
                        .join(" ") || "profissional"}
                    </p>
                  </div>
                  <Badge variant={APPOINTMENT_STATUS_BADGE[appointment.status]}>
                    {APPOINTMENT_STATUS_LABELS[appointment.status]}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-bone-300">
                  <span>{formatDate(appointment.scheduled_time)}</span>
                  <span>
                    {formatTime(appointment.scheduled_time)} – {formatTime(getAppointmentEndTime(appointment))}
                  </span>
                  <span className="text-gold-400">{formatCurrencyBRL(appointment.price_at_booking)}</span>
                </div>

                <div className="mt-auto flex items-center justify-end gap-2 border-t border-ink-700 pt-4">
                  {canClientCancelAppointment(appointment) && (
                    <Button variant="ghost" size="sm" onClick={() => setCancelling(appointment)}>
                      <XCircle className="h-4 w-4 text-danger-500" /> Cancelar
                    </Button>
                  )}
                  <ButtonLink to={ROUTES.dashboardAppointmentDetail(appointment.id)} variant="outline" size="sm">
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