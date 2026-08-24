import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface EditBookingWindowModalProps {
  open: boolean;
  employeeName: string;
  currentValue: number;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (bookingWindowDays: number) => void;
}

export function EditBookingWindowModal({
  open,
  employeeName,
  currentValue,
  isLoading,
  onClose,
  onSubmit,
}: EditBookingWindowModalProps) {
  const [value, setValue] = useState(String(currentValue));

  // Pré-preenche com o valor atual sempre que o modal é reaberto.
  useEffect(() => {
    if (open) setValue(String(currentValue));
  }, [open, currentValue]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numeric = Number(value);
    if (!value || Number.isNaN(numeric) || numeric < 1 || numeric > 365) return;
    onSubmit(numeric);
  }

  return (
    <Modal open={open} onClose={onClose} title="Janela de agendamento" size="sm">
      <p className="text-sm text-bone-400">
        Quantos dias à frente a agenda de <strong className="text-bone-100">{employeeName}</strong> fica aberta pra
        clientes agendarem. Padrão: 30 dias.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Dias à frente"
          type="number"
          min="1"
          max="365"
          step="1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          hint="Entre 1 e 365 dias."
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