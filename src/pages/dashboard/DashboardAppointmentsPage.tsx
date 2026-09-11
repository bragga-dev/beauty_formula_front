import { useState } from "react";
import { CalendarClock, Copy, Eye, ExternalLink, RefreshCw, RotateCcw, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/tables/Pagination";
import { useAdminSchedulings, useAdminSchedulingMutations } from "@/hooks/useScheduling";
import { useAdminPayments, useAdminPaymentMutations } from "@/hooks/usePayment";
import { CancelAppointmentModal } from "@/features/appointments/CancelAppointmentModal";
import { AdminRescheduleModal } from "@/features/appointments/AdminRescheduleModal";
import { RefundPaymentModal } from "@/features/payment/RefundPaymentModal";
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
import {
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_BILLING_TYPE_LABELS,
  isPaymentSettled,
  type PaymentOut,
  type PaymentRefundInput,
} from "@/types/payment";
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

  // Mesma estratégia da tela "Meus Agendamentos" do cliente: um lote de
  // cobranças pra exibir status + ações de pagamento direto no card do
  // agendamento, sem precisar ir pra aba "Pagamentos" só pra conferir se
  // um horário específico já foi pago. A aba "Pagamentos" continua
  // existindo à parte — ela serve outro propósito (busca por cliente,
  // filtro por forma de pagamento, conciliação financeira geral), não é
  // substituída por isso.
  const { data: allPayments } = useAdminPayments({}, 1, 100);
  const paymentBySchedulingId = new Map((allPayments?.items ?? []).map((p) => [p.scheduling_id, p]));
  const { sync, refund } = useAdminPaymentMutations();

  const [editing, setEditing] = useState<SchedulingOut | null>(null);
  const [cancelling, setCancelling] = useState<SchedulingOut | null>(null);
  const [refunding, setRefunding] = useState<PaymentOut | null>(null);

  function handleFilterChange(value: SchedulingFilter) {
    setFilter(value);
    setPage(1);
  }

  async function handleReschedule(payload: SchedulingUpdateInput) {
    if (!editing) return;
    try {
      await update.mutateAsync({ id: editing.id, payload });
      push("Agendamento reagendado com sucesso!", "success");
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

  async function handleSyncPayment(payment: PaymentOut) {
    try {
      await sync.mutateAsync(payment.id);
      push("Pagamento sincronizado com a Asaas.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleRefund(payload: PaymentRefundInput) {
    if (!refunding) return;
    try {
      await refund.mutateAsync({ paymentId: refunding.id, payload });
      push("Pagamento estornado.", "success");
      setRefunding(null);
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
              const payment = paymentBySchedulingId.get(scheduling.id);
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

                  {payment && (
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-ink-700 pt-3 text-sm text-bone-300">
                      <Badge variant={PAYMENT_STATUS_BADGE[payment.status]}>
                        {PAYMENT_STATUS_LABELS[payment.status]}
                      </Badge>
                      <span>
                        {PAYMENT_BILLING_TYPE_LABELS[payment.billing_type as "PIX" | "CREDIT_CARD"] ??
                          payment.billing_type}
                      </span>
                      <span className="text-bone-500">Venc. {formatDate(payment.due_date)}</span>
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-ink-700 pt-4">
                    {payment?.status === "PENDING" && payment.pix_copy_paste && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(payment.pix_copy_paste!).then(() => push("Código Pix copiado.", "success"))}
                      >
                        <Copy className="h-4 w-4" /> Copiar Pix
                      </Button>
                    )}
                    {payment?.status === "PENDING" && payment.invoice_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(payment.invoice_url ?? "", "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="h-4 w-4" /> Cobrança
                      </Button>
                    )}
                    {payment && (
                      <Button variant="ghost" size="icon" onClick={() => handleSyncPayment(payment)} aria-label="Sincronizar com a Asaas">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    {payment && isPaymentSettled(payment) && (
                      <Button variant="ghost" size="icon" onClick={() => setRefunding(payment)} aria-label="Estornar">
                        <RotateCcw className="h-4 w-4 text-danger-500" />
                      </Button>
                    )}
                    {editable && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setCancelling(scheduling)}>
                          <XCircle className="h-4 w-4 text-danger-500" /> Cancelar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(scheduling)}>
                          <CalendarClock className="h-4 w-4 text-gold-400" /> Reagendar
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

      <AdminRescheduleModal
        open={!!editing}
        scheduling={editing}
        isSubmitting={update.isPending}
        onSubmit={handleReschedule}
        onClose={() => setEditing(null)}
      />

      <CancelAppointmentModal
        open={!!cancelling}
        serviceName={cancelling?.service.name}
        isLoading={cancel.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelling(null)}
      />

      <RefundPaymentModal
        open={!!refunding}
        paymentValue={refunding ? formatCurrencyBRL(refunding.value) : undefined}
        isLoading={refund.isPending}
        onClose={() => setRefunding(null)}
        onConfirm={handleRefund}
      />
    </div>
  );
}