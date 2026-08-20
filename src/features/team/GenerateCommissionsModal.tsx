import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CommissionBulkGenerateOut } from "@/types/commission";

interface GenerateCommissionsModalProps {
  open: boolean;
  employeeName: string;
  isLoading?: boolean;
  /** Resultado da última geração, exibido como resumo até o modal ser reaberto/fechado. */
  lastResult?: CommissionBulkGenerateOut | null;
  onClose: () => void;
  onSubmit: (payload: { startDate: string; endDate: string }) => void;
}

export function GenerateCommissionsModal({
  open,
  employeeName,
  isLoading,
  lastResult,
  onClose,
  onSubmit,
}: GenerateCommissionsModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function handleClose() {
    setStartDate("");
    setEndDate("");
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate) return;
    onSubmit({ startDate, endDate });
  }

  return (
    <Modal open={open} onClose={handleClose} title="Gerar comissões" size="sm">
      <p className="text-sm text-bone-400">
        Gera a comissão de todo atendimento concluído de <strong className="text-bone-100">{employeeName}</strong>{" "}
        no período informado que ainda não tenha comissão registrada. Operação segura de repetir — atendimentos
        já com comissão são pulados automaticamente.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Data final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined}
            required
          />
        </div>

        {lastResult && (
          <div className="rounded-card border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm text-bone-300">
            <p>
              <strong className="text-gold-400">{lastResult.created_count}</strong> comissão(ões) gerada(s),{" "}
              <strong className="text-bone-100">{lastResult.skipped_count}</strong> já existente(s) pulada(s) — de{" "}
              {lastResult.total_completed_schedulings} atendimento(s) concluído(s) no período.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Gerar comissões
          </Button>
        </div>
      </form>
    </Modal>
  );
}