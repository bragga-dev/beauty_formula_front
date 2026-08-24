import { useId } from "react";
import { Select } from "@/components/ui/Select";
import { cn } from "@/utils/cn";

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface MonthPickerProps {
  label?: string;
  hint?: string;
  /** "" (vazio, só permitido com allowEmpty) ou "yyyy-MM". */
  value: string;
  onChange: (value: string) => void;
  /** Se true, mostra opção "Todos" e permite ficar sem seleção (uso em filtro). */
  allowEmpty?: boolean;
  yearsBack?: number;
  yearsForward?: number;
  className?: string;
}

/**
 * Seletor de mês/ano — dois <select> combinados em vez de
 * `<input type="month">`.
 *
 * Motivo: o Firefox desktop nunca implementou `type="month"` — o campo
 * degrada silenciosamente pra texto livre, sem máscara nem validação.
 * Isso deixava a pessoa digitar só "8" (sem ano), que ia direto pro
 * backend como "8-01" e quebrava (422, `competencia` não é uma data
 * válida). Com dois selects o valor é sempre "yyyy-MM" bem formado ou
 * vazio — nunca um texto arbitrário.
 */
export function MonthPicker({
  label,
  hint,
  value,
  onChange,
  allowEmpty = false,
  yearsBack = 4,
  yearsForward = 1,
  className,
}: MonthPickerProps) {
  const generatedId = useId();
  const [yearValue, monthValue] = value ? value.split("-") : ["", ""];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: yearsBack + yearsForward + 1 }, (_, i) => currentYear + yearsForward - i);

  function emit(nextYear: string, nextMonth: string) {
    if (!nextYear || !nextMonth) {
      onChange("");
      return;
    }
    onChange(`${nextYear}-${nextMonth}`);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={`${generatedId}-month`} className="text-xs font-medium uppercase tracking-wide text-bone-500">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Select
          id={`${generatedId}-month`}
          aria-label="Mês"
          value={monthValue}
          onChange={(e) => emit(yearValue, e.target.value)}
        >
          <option value="">{allowEmpty ? "Mês" : "Mês…"}</option>
          {MONTH_LABELS.map((name, i) => {
            const monthNum = String(i + 1).padStart(2, "0");
            return (
              <option key={monthNum} value={monthNum}>
                {name}
              </option>
            );
          })}
        </Select>
        <Select aria-label="Ano" value={yearValue} onChange={(e) => emit(e.target.value, monthValue)}>
          <option value="">{allowEmpty ? "Ano" : "Ano…"}</option>
          {years.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </Select>
      </div>
      {allowEmpty && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="self-start text-xs text-bone-600 hover:text-gold-400"
        >
          Limpar mês
        </button>
      )}
      {hint && <p className="text-xs text-bone-600">{hint}</p>}
    </div>
  );
}