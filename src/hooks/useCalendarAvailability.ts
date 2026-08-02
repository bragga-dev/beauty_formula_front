import { useQueries } from "@tanstack/react-query";
import { availabilityService } from "@/services/availability.service";
import type { EmployeeTeamOut } from "@/types/employee";

export interface AggregatedSlot {
  start: string;
  end: string;
  employees: EmployeeTeamOut[];
}

export interface DayAvailability {
  date: string; // yyyy-mm-dd
  slots: AggregatedSlot[];
}

/**
 * Disponibilidade real de um ou mais profissionais, em vários dias de
 * uma vez — a base do calendário dinâmico da Etapa "Data e Horário".
 * Nada aqui é pré-montado: cada dia/horário só aparece se o backend
 * confirmou que existe um bloco livre do tamanho do serviço.
 *
 * - Profissional específico (`employees.length === 1`): os slots do dia
 *   já vêm prontos, um funcionário só.
 * - "Qualquer profissional" (`employees.length > 1`): agrega a agenda de
 *   todos os elegíveis por dia, marcando quem atende cada horário — ao
 *   escolher um horário, o sistema atribui automaticamente o primeiro
 *   profissional livre naquele slot (`slot.employees[0]`).
 *
 * Dispara um request por par (profissional × dia) — o backend só
 * calcula disponibilidade de um funcionário por vez, numa data
 * específica; não existe endpoint de intervalo ainda.
 */
export function useCalendarAvailability(employees: EmployeeTeamOut[], serviceId: string | undefined, days: Date[]) {
  const dateStrings = days.map((d) => d.toISOString().slice(0, 10));
  const enabled = !!serviceId && employees.length > 0 && dateStrings.length > 0;

  const pairs = employees.flatMap((employee) => dateStrings.map((date) => ({ employee, date })));

  const queries = useQueries({
    queries: pairs.map(({ employee, date }) => ({
      queryKey: ["availability", employee.id, serviceId, date],
      queryFn: () => availabilityService.getForEmployee(employee.id, serviceId as string, date),
      enabled,
    })),
  });

  const isLoading = enabled && queries.some((q) => q.isLoading);
  const hasAnySuccess = queries.some((q) => q.isSuccess);
  const isError = enabled && !isLoading && !hasAnySuccess && queries.some((q) => q.isError);

  const byDate = new Map<string, Map<string, AggregatedSlot>>();
  for (const date of dateStrings) byDate.set(date, new Map());

  queries.forEach((q, i) => {
    if (!q.data) return;
    const { employee, date } = pairs[i];
    const bySlot = byDate.get(date);
    if (!bySlot) return;
    q.data.forEach((slot) => {
      const existing = bySlot.get(slot.start);
      if (existing) {
        existing.employees.push(employee);
      } else {
        bySlot.set(slot.start, { start: slot.start, end: slot.end, employees: [employee] });
      }
    });
  });

  const days_: DayAvailability[] = dateStrings.map((date) => ({
    date,
    slots: Array.from(byDate.get(date)?.values() ?? []).sort((a, b) => a.start.localeCompare(b.start)),
  }));

  const daysWithAvailability = new Set(days_.filter((d) => d.slots.length > 0).map((d) => d.date));

  function slotsForDate(date: string): AggregatedSlot[] {
    return days_.find((d) => d.date === date)?.slots ?? [];
  }

  return {
    days: days_,
    daysWithAvailability,
    slotsForDate,
    isLoading,
    isError,
    refetch: () => queries.forEach((q) => q.refetch()),
  };
}