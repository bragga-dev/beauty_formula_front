import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrencyBRL } from "@/utils/format";
import type { PaymentOut } from "@/types/payment";

/**
 * Precisa bater com `DEFAULT_CANCELLATION_FEE_PERCENTAGE` em
 * `payment/models/refund_request_model.py` — não existe endpoint hoje
 * que exponha esse valor pro front, então é hardcoded dos dois lados.
 * Se mudar no backend, mudar aqui também.
 */
const CANCELLATION_FEE_PERCENTAGE = 10;

interface CancelAppointmentModalProps {
  open: boolean;
  serviceName?: string;
  /** Pagamento vinculado ao agendamento, se houver — usado só pra decidir se mostra o aviso de taxa/reembolso. */
  payment?: PaymentOut | null;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function CancelAppointmentModal({
  open,
  serviceName,
  payment,
  isLoading,
  onConfirm,
  onClose,
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // Só mostra o aviso de reembolso se o pagamento já caiu — se ainda
  // está pendente (ou não existe cobrança), cancelar simplesmente
  // encerra o agendamento, sem nada a devolver.
  const isPaid = payment?.status === "RECEIVED" || payment?.status === "CONFIRMED";
  const originalValue = isPaid ? Number(payment!.value) : 0;
  const feeValue = originalValue * (CANCELLATION_FEE_PERCENTAGE / 100);
  const refundValue = originalValue - feeValue;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Conte pra gente o motivo do cancelamento.");
      return;
    }
    onConfirm(reason.trim());
  }

  function handleClose() {
    setReason("");
    setError("");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Cancelar agendamento" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-bone-400">
          {serviceName ? (
            <>
              Tem certeza que deseja cancelar o agendamento de <span className="text-bone-100">{serviceName}</span>?
              Essa ação não pode ser desfeita.
            </>
          ) : (
            "Tem certeza que deseja cancelar este agendamento? Essa ação não pode ser desfeita."
          )}
        </p>

        {isPaid && (
          <div className="rounded-card border border-gold-400/30 bg-gold-400/5 p-4">
            <p className="text-sm text-bone-200">
              Este agendamento já foi pago. Cancelamentos feitos pelo cliente estão sujeitos a uma taxa de{" "}
              <strong className="text-gold-400">{CANCELLATION_FEE_PERCENTAGE}%</strong> sobre o valor do serviço.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-bone-500">Pago</p>
                <p className="mt-0.5 text-sm text-bone-200">{formatCurrencyBRL(originalValue)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-bone-500">Taxa</p>
                <p className="mt-0.5 text-sm text-danger-500">-{formatCurrencyBRL(feeValue)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-bone-500">Você recebe</p>
                <p className="mt-0.5 text-sm text-gold-400">{formatCurrencyBRL(refundValue)}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-bone-500">
              O pedido de reembolso passa por análise do salão antes do estorno — você recebe um e-mail assim que
              for avaliado.
            </p>
          </div>
        )}

        <Textarea
          label="Motivo do cancelamento"
          placeholder="Ex: imprevisto, troquei de horário..."
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          error={error}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Voltar
          </Button>
          <Button type="submit" variant="danger" isLoading={isLoading}>
            {isPaid ? "Cancelar e solicitar reembolso" : "Cancelar agendamento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}