import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { PaymentRefundInput } from "@/types/payment";

interface RefundPaymentModalProps {
  open: boolean;
  paymentValue?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (payload: PaymentRefundInput) => void;
}

export function RefundPaymentModal({ open, paymentValue, isLoading, onClose, onConfirm }: RefundPaymentModalProps) {
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");

  function handleClose() {
    setValue("");
    setDescription("");
    onClose();
  }

  function handleConfirm() {
    onConfirm({
      value: value ? Number(value) : undefined,
      description: description || undefined,
    });
  }

  return (
    <Modal open={open} onClose={handleClose} title="Estornar pagamento" size="sm">
      <p className="text-sm text-bone-400">
        Deixe o valor em branco para estornar o total{paymentValue ? ` (${paymentValue})` : ""}, ou informe um
        valor parcial (ex: para reter uma taxa de cancelamento).
      </p>
      <div className="mt-4 space-y-4">
        <Input
          label="Valor a estornar (opcional)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Total"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Input
          label="Motivo (opcional)"
          placeholder="Ex: cancelamento solicitado pelo cliente"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="danger" isLoading={isLoading} onClick={handleConfirm}>
          Estornar
        </Button>
      </div>
    </Modal>
  );
}