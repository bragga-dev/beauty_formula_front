import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CommissionOut } from "@/types/commission";

interface EditCommissionValueModalProps {
  open: boolean;
  commission: CommissionOut | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (value: number) => void;
}

export function EditCommissionValueModal({
  open,
  commission,
  isLoading,
  onClose,
  onSubmit,
}: EditCommissionValueModalProps) {
  const [value, setValue] = useState("");

  // Pré-preenche com o valor atual sempre que uma nova comissão é aberta pro edit.
  useEffect(() => {
    if (commission) setValue(commission.commission_value);
  }, [commission]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numeric = Number(value);
    if (!value || Number.isNaN(numeric) || numeric < 0) return;
    onSubmit(numeric);
  }

  return (
    <Modal open={open} onClose={onClose} title="Corrigir valor da comissão" size="sm">
      {commission && (
        <p className="text-sm text-bone-400">
          Ajuste manual do valor de <strong className="text-bone-100">{commission.service_name}</strong> —{" "}
          {commission.client_name}. Exceção à regra automática de cálculo; só é permitido enquanto a comissão
          está pendente.
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Valor da comissão (R$)"
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}