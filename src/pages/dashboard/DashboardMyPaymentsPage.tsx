import { CreditCard, Copy, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMyPayments } from "@/hooks/usePayment";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate } from "@/utils/format";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_BADGE,
  PAYMENT_BILLING_TYPE_LABELS,
  type PaymentOut,
} from "@/types/payment";

export function DashboardMyPaymentsPage() {
  const { data, isLoading, isError, refetch } = useMyPayments();
  const { push } = useToast();

  async function copyPixCode(payment: PaymentOut) {
    if (!payment.pix_copy_paste) return;
    await navigator.clipboard.writeText(payment.pix_copy_paste);
    push("Código Pix copiado.", "success");
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl">Meus Pagamentos</h1>
        <p className="mt-1 text-bone-500">Acompanhe as cobranças dos seus agendamentos.</p>
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
            icon={CreditCard}
            title="Nenhum pagamento encontrado"
            description="Suas cobranças aparecem aqui assim que você criar um agendamento."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data?.items.map((payment) => (
              <Card key={payment.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base uppercase tracking-wide text-bone-50">
                      {payment.service_name ?? "Serviço"}
                    </p>
                    {payment.scheduled_time && (
                      <p className="mt-1 text-sm text-bone-500">{formatDate(payment.scheduled_time)}</p>
                    )}
                  </div>
                  <Badge variant={PAYMENT_STATUS_BADGE[payment.status]}>
                    {PAYMENT_STATUS_LABELS[payment.status]}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-bone-300">
                  <span className="text-gold-400">{formatCurrencyBRL(payment.value)}</span>
                  <span>{PAYMENT_BILLING_TYPE_LABELS[payment.billing_type as "PIX" | "CREDIT_CARD"] ?? payment.billing_type}</span>
                  <span className="text-bone-500">Venc. {formatDate(payment.due_date)}</span>
                </div>

                {payment.status === "PENDING" && (
                  <div className="mt-1 flex flex-wrap items-center justify-end gap-2 border-t border-ink-700 pt-3">
                    {payment.pix_copy_paste && (
                      <Button variant="ghost" size="sm" onClick={() => copyPixCode(payment)}>
                        <Copy className="h-4 w-4" /> Copiar Pix
                      </Button>
                    )}
                    {payment.invoice_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(payment.invoice_url ?? "", "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="h-4 w-4" /> Pagar
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}