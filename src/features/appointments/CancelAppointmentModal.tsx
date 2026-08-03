import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface CancelAppointmentModalProps {
  open: boolean;
  serviceName?: string;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function CancelAppointmentModal({
  open,
  serviceName,
  isLoading,
  onConfirm,
  onClose,
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

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
            Cancelar agendamento
          </Button>
        </div>
      </form>
    </Modal>
  );
}