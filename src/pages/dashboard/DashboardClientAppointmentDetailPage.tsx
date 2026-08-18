import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Scissors,
  User,
  UserX,
  XCircle,
  StickyNote,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEmployeeScheduling, useEmployeeSchedulingMutations } from "@/hooks/useScheduling";
import { CancelAppointmentModal } from "@/features/appointments/CancelAppointmentModal";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate, formatDuration, formatTime, initials } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import {
  SCHEDULING_STATUS_BADGE,
  SCHEDULING_STATUS_LABELS,
  canEmployeeActOnScheduling,
  getSchedulingEndTime,
} from "@/types/scheduling.types";
import type { ApiError } from "@/types/common";

export function DashboardClientAppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { data: scheduling, isLoading, isError, refetch } = useEmployeeScheduling(appointmentId);
  const { complete, markNoShow, cancel } = useEmployeeSchedulingMutations();
  const { push } = useToast();

  const [completeOpen, setCompleteOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  async function handleComplete() {
    if (!scheduling) return;
    try {
      await complete.mutateAsync(scheduling.id);
      push("Atendimento concluído.", "success");
      setCompleteOpen(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleNoShow() {
    if (!scheduling) return;
    try {
      await markNoShow.mutateAsync(scheduling.id);
      push("Agendamento marcado como não comparecido.", "success");
      setNoShowOpen(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleCancel(reason: string) {
    if (!scheduling) return;
    try {
      await cancel.mutateAsync({ id: scheduling.id, payload: { reason } });
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

  if (isError || !scheduling) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState message="Não foi possível carregar este agendamento." onRetry={() => refetch()} />
      </div>
    );
  }

  const clientName =
    [scheduling.client.first_name, scheduling.client.last_name].filter(Boolean).join(" ") || "Cliente";

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(ROUTES.dashboardMyClientAppointments)}
        className="mb-6 flex items-center gap-1.5 text-sm text-bone-500 hover:text-bone-100"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para meus atendimentos
      </button>

      <Card>
        <CardHeader className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl uppercase tracking-wide text-bone-50">{scheduling.service.name}</p>
            <p className="mt-1 text-sm text-bone-500">
              Agendado em {formatDate(scheduling.created_at)} às {formatTime(scheduling.created_at)}
            </p>
          </div>
          <Badge variant={SCHEDULING_STATUS_BADGE[scheduling.status]}>
            {SCHEDULING_STATUS_LABELS[scheduling.status]}
          </Badge>
        </CardHeader>

        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Avatar
                src={scheduling.client.photo_url}
                alt={clientName}
                fallback={initials(scheduling.client.first_name, scheduling.client.last_name)}
                size="sm"
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-bone-500">Cliente</p>
                <p className="text-sm text-bone-100">{clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-gold-400">
                <CalendarClock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-bone-500">Data</p>
                <p className="text-sm text-bone-100">{formatDate(scheduling.scheduled_time)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-gold-400">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-bone-500">Horário</p>
                <p className="text-sm text-bone-100">
                  {formatTime(scheduling.scheduled_time)} – {formatTime(getSchedulingEndTime(scheduling))}
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
                  {scheduling.service.name} · {formatDuration(scheduling.duration_at_booking)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-card border border-ink-700 px-4 py-3">
            <span className="text-sm text-bone-400">Valor</span>
            <span className="font-display text-lg text-gold-400">
              {formatCurrencyBRL(scheduling.price_at_booking)}
            </span>
          </div>

          {scheduling.notes && (
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-bone-500">
                <StickyNote className="h-3.5 w-3.5" /> Observações do cliente
              </p>
              <p className="mt-2 text-sm text-bone-300">{scheduling.notes}</p>
            </div>
          )}

          {scheduling.status === "canceled" && scheduling.canceled_reason && (
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-bone-500">
                <User className="h-3.5 w-3.5" /> Motivo do cancelamento
              </p>
              <p className="mt-2 text-sm text-bone-300">{scheduling.canceled_reason}</p>
            </div>
          )}

          {canEmployeeActOnScheduling(scheduling) && (
            <div className="flex flex-wrap justify-end gap-3 border-t border-ink-700 pt-5">
              <Button variant="ghost" onClick={() => setNoShowOpen(true)}>
                <UserX className="h-4 w-4 text-bone-400" /> Não compareceu
              </Button>
              <Button variant="danger" onClick={() => setCancelOpen(true)}>
                <XCircle className="h-4 w-4" /> Cancelar
              </Button>
              <Button onClick={() => setCompleteOpen(true)}>
                <CheckCircle2 className="h-4 w-4" /> Concluir atendimento
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={completeOpen}
        title="Concluir atendimento"
        description={`Confirma que o atendimento de "${scheduling.service.name}" para ${clientName} foi concluído?`}
        confirmLabel="Concluir"
        isLoading={complete.isPending}
        onConfirm={handleComplete}
        onCancel={() => setCompleteOpen(false)}
      />

      <ConfirmDialog
        open={noShowOpen}
        title="Marcar não comparecimento"
        description={`Confirma que ${clientName} não compareceu a esse agendamento?`}
        confirmLabel="Marcar não compareceu"
        variant="danger"
        isLoading={markNoShow.isPending}
        onConfirm={handleNoShow}
        onCancel={() => setNoShowOpen(false)}
      />

      <CancelAppointmentModal
        open={cancelOpen}
        serviceName={scheduling.service.name}
        isLoading={cancel.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelOpen(false)}
      />
    </div>
  );
}