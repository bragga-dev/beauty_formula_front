import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarClock, Clock, Scissors, Star, User, XCircle, StickyNote } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useScheduling, useSchedulingMutations } from "@/hooks/useScheduling";
import { useMyRatings } from "@/hooks/useRatings";
import { CancelAppointmentModal } from "@/features/appointments/CancelAppointmentModal";
import { RateAppointmentModal } from "@/features/ratings/RateAppointmentModal";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate, formatDuration, formatTime, initials } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import {
  SCHEDULING_STATUS_BADGE,
  SCHEDULING_STATUS_LABELS,
  canClientCancelScheduling,
  getSchedulingEndTime,
} from "@/types/scheduling.types";
import type { ApiError } from "@/types/common";

export function DashboardAppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { data: scheduling, isLoading, isError, refetch } = useScheduling(appointmentId);
  const { cancel } = useSchedulingMutations();
  const { data: myRatings } = useMyRatings();
  const { push } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

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

  const employeeName =
    [scheduling.employee.first_name, scheduling.employee.last_name].filter(Boolean).join(" ") || "Profissional";
  // Mesma regra do que na listagem: unicidade agora é por
  // serviço+funcionário, não por agendamento.
  const existingRating = myRatings?.items.find(
    (r) => r.service.id === scheduling.service.id && r.employee.id === scheduling.employee.id,
  );

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

            <div className="flex items-center gap-3">
              <Avatar
                src={scheduling.employee.photo_url}
                alt={employeeName}
                fallback={initials(scheduling.employee.first_name, scheduling.employee.last_name)}
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
              {formatCurrencyBRL(scheduling.price_at_booking)}
            </span>
          </div>

          {scheduling.notes && (
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-bone-500">
                <StickyNote className="h-3.5 w-3.5" /> Observações
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

          {existingRating && (
            <div>
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-bone-500">
                <Star className="h-3.5 w-3.5" /> Sua avaliação
              </p>
              <p className="mt-2 text-sm text-gold-400">{"★".repeat(existingRating.rating)}</p>
              {existingRating.comment && <p className="mt-1 text-sm text-bone-300">{existingRating.comment}</p>}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-ink-700 pt-5">
            {scheduling.status === "completed" && (
              <Button variant="outline" onClick={() => setRateOpen(true)}>
                <Star className="h-4 w-4" /> {existingRating ? "Editar avaliação" : "Avaliar atendimento"}
              </Button>
            )}
            {canClientCancelScheduling(scheduling) && (
              <Button variant="danger" onClick={() => setCancelOpen(true)}>
                <XCircle className="h-4 w-4" /> Cancelar agendamento
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <CancelAppointmentModal
        open={cancelOpen}
        serviceName={scheduling.service.name}
        isLoading={cancel.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelOpen(false)}
      />

      <RateAppointmentModal
        open={rateOpen}
        scheduling={scheduling}
        existingRating={existingRating}
        onClose={() => setRateOpen(false)}
      />
    </div>
  );
}