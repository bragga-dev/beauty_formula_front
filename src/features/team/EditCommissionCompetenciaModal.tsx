import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { dateToMonthInput, formatMonthYear, monthInputToDate } from "@/utils/format";
import type { CommissionOut } from "@/types/commission";

interface EditCommissionCompetenciaModalProps {
  open: boolean;
  commission: CommissionOut | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (competencia: string) => void;
}

export function EditCommissionCompetenciaModal({
  open,
  commission,
  isLoading,
  onClose,
  onSubmit,
}: EditCommissionCompetenciaModalProps) {
  const [month, setMonth] = useState("");

  // Pré-preenche com a competência atual sempre que uma nova comissão é aberta pro edit.
  useEffect(() => {
    if (commission) setMonth(dateToMonthInput(commission.competencia));
  }, [commission]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!month) return;
    onSubmit(monthInputToDate(month));
  }

  return (
    <Modal open={open} onClose={onClose} title="Corrigir competência" size="sm">
      {commission && (
        <p className="text-sm text-bone-400">
          Reclassifica em qual mês <strong className="text-bone-100">{commission.service_name}</strong> —{" "}
          {commission.client_name} entra nos relatórios. Não afeta valor nem repasse, então funciona mesmo em
          comissões já pagas ou canceladas.{" "}
          {commission.competencia_was_adjusted && (
            <>
              Competência calculada originalmente:{" "}
              <strong className="text-bone-100">{formatMonthYear(commission.competencia_original)}</strong>.
            </>
          )}
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <MonthPicker label="Mês de competência" value={month} onChange={setMonth} yearsBack={5} />
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