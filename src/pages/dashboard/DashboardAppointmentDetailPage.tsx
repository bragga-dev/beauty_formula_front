import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarClock, Clock, Scissors, User, XCircle, StickyNote } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAppointment, useAppointmentMutations } from "@/hooks/useAppointments";
import { CancelAppointmentModal } from "@/features/appointments/CancelAppointmentModal";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate, formatDuration, formatTime, initials } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import {
  APPOINTMENT_STATUS_BADGE,
  APPOINTMENT_STATUS_LABELS,
  canClientCancelAppointment,
  getAppointmentEndTime,
} from "@/types/appointment";
import type { ApiError } from "@/types/common";

export function DashboardAppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { data: appointment, isLoading, isError, refetch } = useAppointment(appointmentId);
  const { cancel } = useAppointmentMutations();
  const { push } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);

  async function handleCancel(reason: string) {
    if (!appointment) return;
    try {
      await cancel.mutateAsync({ id: appointment.id, reason });
      push("Agendamento cancelado.", "success");
      setCancelOpen(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (isError || !appointment) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState message="Não foi possível carregar este agendamento." onRetry={() => refetch()} />
      </div>
    );
  }

  const employeeName =
    [appointment.employee.first_name, appointment.employee.last_name].filter(Boolean).join(" ") || "Profissional";

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(ROUTES.dashboardMyAppointments)}
        className="mb-6 flex items-center gap-1.5 text-sm text-bone-500 hover:text-bone-100"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para meus agendamentos
      </button>

      <Card>
        <CardHeader className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl uppercase tracking-wide text-bone-50">{appointment.service.name}</p>
            <p className="mt-1 text-sm text-bone-500">
              Agendado em {formatDate(appointment.created_at)} às {formatTime(appointment.created_at)}
            </p>
          </div>
          <Badge variant={APPOINTMENT_STATUS_BADGE[appointment.status]}>
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </Badge>
        </CardHeader>

        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-gold-400">
                <CalendarClock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-bone-500">Data</p>
                <p className="text-sm text-bone-100">{formatDate(appointment.scheduled_time)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-gold-400">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-bone-500">Horário</p>
                <p className="text-sm text-bone-100">
                  {formatTime(appointment.scheduled_time)} – {formatTime(getAppointmentEndTime(appointment))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-gold-400">
                <Scissors className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-bone-500">Serviço</p>
                <p className="text-sm text-bone-100">
                  {appointment.service.name} · {formatDuration(appointment.duration_at_booking)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar
                src={appointment.employee.photo_url}
                alt={employeeName}
                fallback={initials(appointment.employee.first_name, appointment.employee.last_name)}
                size="sm"
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-bone-500">Profissional</p>
                <p className="text-sm text-bone-100">{employeeName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-card border border-ink-700 px-4 py-3">
            <span className="text-sm text-bone-400">Valor</span>
            <span className="font-display text-lg text-gold-400">
              {formatCurrencyBRL(appointment.price_at_booking)}
            </span>
          </div>

          {appointment.notes && (
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-bone-500">
                <StickyNote className="h-3.5 w-3.5" /> Observações
              </p>
              <p className="mt-2 text-sm text-bone-300">{appointment.notes}</p>
            </div>
          )}

          {appointment.status === "canceled" && appointment.canceled_reason && (
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-bone-500">
                <User className="h-3.5 w-3.5" /> Motivo do cancelamento
              </p>
              <p className="mt-2 text-sm text-bone-300">{appointment.canceled_reason}</p>
            </div>
          )}

          {canClientCancelAppointment(appointment) && (
            <div className="flex justify-end border-t border-ink-700 pt-5">
              <Button variant="danger" onClick={() => setCancelOpen(true)}>
                <XCircle className="h-4 w-4" /> Cancelar agendamento
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <CancelAppointmentModal
        open={cancelOpen}
        serviceName={appointment.service.name}
        isLoading={cancel.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelOpen(false)}
      />
    </div>
  );
}