import { useEffect, useId, useRef, useState } from "react";
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
  /**
   * Meses que existem de verdade (ex: vindos do backend), formato
   * "yyyy-MM". Quando informado (e não vazio), o dropdown de Ano só
   * mostra os anos presentes aqui, e o de Mês só os meses do ano
   * selecionado — em vez do intervalo fixo `yearsBack`/`yearsForward`.
   * Sem essa lista (undefined ou []), cai no comportamento fixo padrão.
   */
  availableMonths?: string[];
}

/**
 * Seletor de mês/ano — dois <select> combinados em vez de
 * `<input type="month">`.
 *
 * Motivo do design com dois selects: o Firefox desktop nunca implementou
 * `type="month"` — o campo degrada silenciosamente pra texto livre, sem
 * máscara nem validação. Isso deixava a pessoa digitar só "8" (sem ano),
 * que ia direto pro backend como "8-01" e quebrava (422, `competencia`
 * não é uma data válida). Com dois selects o valor é sempre "yyyy-MM"
 * bem formado ou vazio — nunca um texto arbitrário.
 *
 * Estado local (`pending`): os dois <select> são preenchidos SEPARADAMENTE
 * pelo usuário — é fisicamente impossível escolher mês e ano no mesmo
 * clique. Por isso o componente precisa manter o par (mês, ano) em estado
 * próprio enquanto a seleção está incompleta; se ele dependesse só da
 * prop `value` (que só existe como "yyyy-MM" quando os DOIS já foram
 * escolhidos), a primeira escolha seria sempre descartada no re-render
 * seguinte — porque `onChange` ainda não tem um valor completo pra
 * emitir, `value` continua "" vindo de fora, e o <select> que acabou de
 * ser escolhido voltaria pro placeholder. Isso é exatamente o bug de
 * "a seleção não fica fixada".
 *
 * `lastEmitted` existe pra diferenciar um "eco" do nosso próprio
 * `onChange` (que não deve resetar o estado local incompleto) de uma
 * mudança genuinamente externa de `value` (ex: outro botão da página
 * limpando os filtros) — só nesse segundo caso resincronizamos `pending`
 * a partir da prop.
 */
function splitValue(value: string): { year: string; month: string } {
  const [year, month] = value ? value.split("-") : ["", ""];
  return { year: year ?? "", month: month ?? "" };
}

export function MonthPicker({
  label,
  hint,
  value,
  onChange,
  allowEmpty = false,
  yearsBack = 4,
  yearsForward = 1,
  className,
  availableMonths,
}: MonthPickerProps) {
  const generatedId = useId();
  const lastEmitted = useRef(value);
  const [pending, setPending] = useState(() => splitValue(value));

  // Só resincroniza a partir da prop quando a mudança não veio do nosso
  // próprio onChange (ex: um "Limpar filtros" em outro lugar da página).
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setPending(splitValue(value));
    }
  }, [value]);

  const { year: yearValue, month: monthValue } = pending;

  const hasDynamicData = !!availableMonths && availableMonths.length > 0;

  // Modo dinâmico: só os anos/meses que realmente têm dado. Ano restringe
  // quais meses aparecem; sem ano escolhido ainda, mostra os meses de
  // TODOS os anos disponíveis (união), pra não travar a escolha na ordem.
  const dynamicYears = hasDynamicData
    ? Array.from(new Set(availableMonths!.map((m) => m.slice(0, 4)))).sort((a, b) => Number(b) - Number(a))
    : null;

  const dynamicMonthsForYear = hasDynamicData
    ? new Set(
        availableMonths!
          .filter((m) => !yearValue || m.startsWith(yearValue))
          .map((m) => m.slice(5, 7)),
      )
    : null;

  const currentYear = new Date().getFullYear();
  const fallbackYears = Array.from({ length: yearsBack + yearsForward + 1 }, (_, i) => currentYear + yearsForward - i);

  const years = dynamicYears ?? fallbackYears.map(String);
  const monthOptions = dynamicMonthsForYear
    ? MONTH_LABELS.map((name, i) => ({ name, num: String(i + 1).padStart(2, "0") })).filter(
        // Sempre mantém o mês já selecionado visível, mesmo que a lista
        // dinâmica mude embaixo do usuário (ex: outro admin corrige uma
        // competência enquanto esta tela está aberta).
        ({ num }) => dynamicMonthsForYear.has(num) || num === monthValue,
      )
    : MONTH_LABELS.map((name, i) => ({ name, num: String(i + 1).padStart(2, "0") }));

  function commit(next: { year: string; month: string }) {
    setPending(next);
    const emitted = next.year && next.month ? `${next.year}-${next.month}` : "";
    lastEmitted.current = emitted;
    onChange(emitted);
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
          onChange={(e) => commit({ year: yearValue, month: e.target.value })}
        >
          <option value="">{allowEmpty ? "Mês" : "Mês…"}</option>
          {monthOptions.map(({ name, num }) => (
            <option key={num} value={num}>
              {name}
            </option>
          ))}
        </Select>
        <Select aria-label="Ano" value={yearValue} onChange={(e) => commit({ year: e.target.value, month: monthValue })}>
          <option value="">{allowEmpty ? "Ano" : "Ano…"}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>
      </div>
      {allowEmpty && (yearValue || monthValue) && (
        <button
          type="button"
          onClick={() => commit({ year: "", month: "" })}
          className="self-start text-xs text-bone-600 hover:text-gold-400"
        >
          Limpar mês
        </button>
      )}
      {hint && <p className="text-xs text-bone-600">{hint}</p>}
    </div>
  );
}