import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrencyBRL } from "@/utils/format";
import type { RefundRequestOut } from "@/types/refund-request";

interface ReviewRefundRequestModalProps {
  open: boolean;
  refundRequest: RefundRequestOut | null;
  isApproving?: boolean;
  isRejecting?: boolean;
  onClose: () => void;
  onApprove: (adminNotes: string) => void;
  onReject: (adminNotes: string) => void;
}

export function ReviewRefundRequestModal({
  open,
  refundRequest,
  isApproving,
  isRejecting,
  onClose,
  onApprove,
  onReject,
}: ReviewRefundRequestModalProps) {
  const [adminNotes, setAdminNotes] = useState("");

  function handleClose() {
    setAdminNotes("");
    onClose();
  }

  if (!refundRequest) return null;

  return (
    <Modal open={open} onClose={handleClose} title="Analisar pedido de reembolso" size="sm">
      <div className="space-y-1 text-sm">
        <p className="text-bone-400">
          <span className="text-bone-500">Cliente:</span> {refundRequest.client_name}
        </p>
        {refundRequest.service_name && (
          <p className="text-bone-400">
            <span className="text-bone-500">Serviço:</span> {refundRequest.service_name}
          </p>
        )}
        {refundRequest.reason && (
          <p className="text-bone-400">
            <span className="text-bone-500">Motivo:</span> {refundRequest.reason}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 rounded-card border border-ink-700 p-3 text-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-bone-500">Original</p>
          <p className="mt-1 text-bone-200">{formatCurrencyBRL(refundRequest.original_value)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-bone-500">Taxa ({Number(refundRequest.fee_percentage)}%)</p>
          <p className="mt-1 text-danger-500">-{formatCurrencyBRL(refundRequest.fee_value)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-bone-500">A devolver</p>
          <p className="mt-1 text-gold-400">{formatCurrencyBRL(refundRequest.refund_value)}</p>
        </div>
      </div>

      <div className="mt-4">
        <Textarea
          label="Observações (opcional)"
          placeholder="Ex: estorno aprovado conforme política de cancelamento"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="outline" isLoading={isRejecting} onClick={() => onReject(adminNotes)}>
          Rejeitar
        </Button>
        <Button variant="primary" isLoading={isApproving} onClick={() => onApprove(adminNotes)}>
          Aprovar e estornar
        </Button>
      </div>
    </Modal>
  );
}