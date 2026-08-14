import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, Copy, CreditCard, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { usePaymentForScheduling, usePaymentMutations } from "@/hooks/usePayment";
import { useToast } from "@/app/providers/toast-context";
import {
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUS_LABELS,
  isPaymentSettled,
  type PaymentBillingType,
  type PaymentOut,
} from "@/types/payment";
import type { ApiError } from "@/types/common";

interface PaymentPanelProps {
  schedulingId: string;
  /** Cobrança já existente pra esse agendamento, se houver (evita duplicar). */
  existingPayment?: PaymentOut;
  onCharged?: (payment: PaymentOut) => void;
  /** Disparado uma única vez quando a cobrança é identificada como paga. */
  onSettled?: (payment: PaymentOut) => void;
}

const METHODS: { value: PaymentBillingType; label: string; icon: typeof QrCode; description: string }[] = [
  { value: "PIX", label: "Pix", icon: QrCode, description: "Aprovação na hora, com QR Code." },
  { value: "CREDIT_CARD", label: "Cartão de Crédito", icon: CreditCard, description: "Pagamento via link seguro da Asaas." },
];

export function PaymentPanel({ schedulingId, existingPayment, onCharged, onSettled }: PaymentPanelProps) {
  const { push } = useToast();
  const { createCharge } = usePaymentMutations();

  const [billingType, setBillingType] = useState<PaymentBillingType | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [result, setResult] = useState<PaymentOut | null>(null);

  // Repolla enquanto já existe alguma cobrança pra esse agendamento (local
  // ou vinda do agendamento) e ela ainda não foi liquidada — é assim que
  // o status aqui reflete o processamento do webhook da Asaas sem o
  // cliente precisar recarregar a página.
  const hasChargePending = !!(result ?? existingPayment) && !isPaymentSettled((result ?? existingPayment)!);
  const { payment: polledPayment } = usePaymentForScheduling(schedulingId, { poll: hasChargePending });

  const payment = polledPayment ?? result ?? existingPayment ?? null;

  useEffect(() => {
    if (payment && isPaymentSettled(payment)) {
      onSettled?.(payment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.status]);

  async function handleSubmit() {
    if (!billingType) return;
    try {
      const created = await createCharge.mutateAsync({
        scheduling_id: schedulingId,
        billing_type: billingType,
        cpf_cnpj: billingType === "CREDIT_CARD" && cpfCnpj ? cpfCnpj.replace(/\D/g, "") : undefined,
      });
      setResult(created);
      onCharged?.(created);
      push("Cobrança gerada com sucesso.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function copyPixCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      push("Código Pix copiado.", "success");
    } catch {
      push("Não foi possível copiar o código.", "error");
    }
  }

  // Já existe cobrança (nova ou vinda do agendamento) — mostra o status
  // e as instruções de pagamento em vez do formulário de escolha.
  if (payment) {
    return (
      <div className="space-y-4 rounded-card border border-ink-700 bg-ink-800/60 p-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm uppercase tracking-wide text-bone-50">Pagamento</p>
          <Badge variant={PAYMENT_STATUS_BADGE[payment.status]}>{PAYMENT_STATUS_LABELS[payment.status]}</Badge>
        </div>

        {isPaymentSettled(payment) && (
          <div className="flex items-center gap-2 text-sm text-success-500">
            <CheckCircle2 className="h-4 w-4" /> Pagamento confirmado.
          </div>
        )}

        {!isPaymentSettled(payment) && payment.billing_type === "PIX" && payment.pix_copy_paste && (
          <div className="space-y-3">
            {payment.pix_qr_code && (
              <img
                src={`data:image/png;base64,${payment.pix_qr_code}`}
                alt="QR Code Pix"
                className="mx-auto h-48 w-48 rounded-card border border-ink-700 bg-bone-50 p-2"
              />
            )}
            <div className="flex items-center gap-2 rounded-card border border-ink-700 bg-ink-900 px-3 py-2">
              <p className="min-w-0 flex-1 truncate text-xs text-bone-400">{payment.pix_copy_paste}</p>
              <Button type="button" size="sm" variant="ghost" onClick={() => copyPixCode(payment.pix_copy_paste!)}>
                <Copy className="h-3.5 w-3.5" /> Copiar
              </Button>
            </div>
            <p className="text-xs text-bone-600">
              Escaneie o QR Code ou copie o código no app do seu banco. A confirmação é automática — o status aqui
              atualiza assim que o pagamento for processado.
            </p>
          </div>
        )}

        {!isPaymentSettled(payment) && payment.billing_type === "CREDIT_CARD" && payment.invoice_url && (
          <div className="space-y-2">
            <p className="text-sm text-bone-300">Finalize o pagamento com cartão no link seguro da Asaas.</p>
            <Button type="button" fullWidth onClick={() => window.open(payment.invoice_url!, "_blank")}>
              <ExternalLink className="h-4 w-4" /> Pagar com cartão
            </Button>
          </div>
        )}

        {payment.status === "OVERDUE" && (
          <p className="text-xs text-danger-500">Cobrança vencida. Entre em contato para gerar uma nova.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-card border border-ink-700 bg-ink-800/60 p-5">
      <p className="font-display text-sm uppercase tracking-wide text-bone-50">Forma de pagamento</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {METHODS.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => setBillingType(value)}
            className={cn(
              "flex items-start gap-3 rounded-card border p-4 text-left transition-colors",
              billingType === value
                ? "border-crimson-500 bg-crimson-500/5"
                : "border-ink-700 bg-ink-900/40 hover:border-gold-400/50",
            )}
          >
            <Icon className="h-5 w-5 shrink-0 text-gold-400" />
            <div className="min-w-0">
              <p className="font-display text-sm uppercase tracking-wide text-bone-50">{label}</p>
              <p className="mt-0.5 text-xs text-bone-500">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {billingType === "CREDIT_CARD" && (
        <Input
          label="CPF ou CNPJ"
          placeholder="Somente números"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(e.target.value)}
          leftIcon={<Banknote className="h-4 w-4" />}
          hint="Necessário na primeira cobrança com cartão — fica salvo pras próximas."
        />
      )}

      <Button
        fullWidth
        size="lg"
        disabled={!billingType}
        isLoading={createCharge.isPending}
        onClick={handleSubmit}
      >
        Gerar cobrança
      </Button>
    </div>
  );
}