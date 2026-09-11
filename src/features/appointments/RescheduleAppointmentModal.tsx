import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useEligibleEmployees } from "@/hooks/useAvailability";
import { useCalendarAvailability, type AggregatedSlot } from "@/hooks/useCalendarAvailability";
import { useSchedulingMutations } from "@/hooks/useScheduling";
import { useToast } from "@/app/providers/toast-context";
import { formatTime, initials } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { EmployeeTeamOut } from "@/types/employee";
import type { SchedulingOut } from "@/types/scheduling.types";
import type { ApiError } from "@/types/common";

// Mesma janela de dias do fluxo padrão de agendamento (BookingPage) —
// mantém o mesmo teto de disponibilidade calculado no backend.
const DAYS_WINDOW = 30;

function nextDays(count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function employeeName(employee: { first_name?: string | null; last_name?: string | null }): string {
  return [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Profissional";
}

interface RescheduleAppointmentModalProps {
  open: boolean;
  scheduling: SchedulingOut | null;
  onClose: () => void;
  /** Disparado depois que o reagendamento é confirmado com sucesso. */
  onRescheduled?: (newScheduling: SchedulingOut) => void;
}

/**
 * Reagendamento do cliente — reaproveita exatamente os mesmos hooks de
 * disponibilidade da Etapa 2/3 do fluxo padrão de agendamento
 * (`useEligibleEmployees` + `useCalendarAvailability`), então um horário
 * só aparece aqui se o backend confirmar que existe vaga real, do mesmo
 * jeito que em `BookingPage`.
 */
export function RescheduleAppointmentModal({
  open,
  scheduling,
  onClose,
  onRescheduled,
}: RescheduleAppointmentModalProps) {
  const { push } = useToast();
  const { reschedule } = useSchedulingMutations();

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeTeamOut | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AggregatedSlot | null>(null);

  const serviceId = scheduling?.service.id;

  const {
    data: eligibleEmployees,
    isLoading: loadingEligible,
    isError: eligibleError,
    refetch: refetchEligible,
  } = useEligibleEmployees(open ? serviceId : undefined);

  const calendarEmployees = useMemo<EmployeeTeamOut[]>(
    () => (selectedEmployee ? [selectedEmployee] : []),
    [selectedEmployee],
  );

  // Usa a janela configurada pelo admin pra esse funcionário — sem isso,
  // um funcionário com janela maior que o padrão (30) ficaria travado no
  // padrão aqui, mesmo já refletindo certo no fluxo normal de agendamento.
  const days = useMemo(
    () => nextDays(selectedEmployee?.booking_window_days ?? DAYS_WINDOW),
    [open, selectedEmployee],
  );

  const calendar = useCalendarAvailability(open ? calendarEmployees : [], serviceId, open ? days : []);

  // Ao abrir, pré-seleciona o profissional atual do agendamento (se ele
  // ainda estiver entre os elegíveis) — reagendar sem trocar de
  // profissional é o caso mais comum.
  useEffect(() => {
    if (!open || !scheduling || selectedEmployee || !eligibleEmployees) return;
    const current = eligibleEmployees.find((e) => e.id === scheduling.employee.id);
    setSelectedEmployee(current ?? eligibleEmployees[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scheduling, eligibleEmployees]);

  // Assim que a disponibilidade do profissional selecionado chega,
  // escolhe automaticamente o primeiro dia com vaga real.
  useEffect(() => {
    if (!open || selectedDate || calendar.isLoading || calendar.isError) return;
    const firstAvailable = calendar.days.find((d) => d.slots.length > 0);
    if (firstAvailable) {
      setSelectedDate(new Date(`${firstAvailable.date}T00:00:00`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedDate, calendar.isLoading, calendar.isError, calendar.days]);

  function handleClose() {
    setSelectedEmployee(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    onClose();
  }

  function selectEmployee(employee: EmployeeTeamOut) {
    setSelectedEmployee(employee);
    setSelectedDate(null);
    setSelectedSlot(null);
  }

  function selectDay(day: Date) {
    setSelectedDate(day);
    setSelectedSlot(null);
  }

  async function handleConfirm() {
    if (!scheduling || !selectedEmployee || !selectedSlot) return;
    try {
      const updated = await reschedule.mutateAsync({
        id: scheduling.id,
        payload: {
          scheduled_time: selectedSlot.start,
          employee_id: selectedEmployee.id !== scheduling.employee.id ? selectedEmployee.id : undefined,
        },
      });
      push("Agendamento reagendado com sucesso!", "success");
      onRescheduled?.(updated);
      handleClose();
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  if (!scheduling) return null;

  const selectedDateStr = selectedDate ? selectedDate.toISOString().slice(0, 10) : undefined;
  const slotsForSelectedDate = selectedDateStr ? calendar.slotsForDate(selectedDateStr) : [];
  const noAvailabilityInWindow = !calendar.isLoading && !calendar.isError && !!selectedEmployee && !selectedDate;

  return (
    <Modal open={open} onClose={handleClose} title="Reagendar atendimento" size="lg">
      <p className="text-sm text-bone-400">
        Escolha um novo horário para <span className="text-bone-100">{scheduling.service.name}</span>. O
        agendamento atual só é liberado depois que o novo for confirmado.
      </p>

      {/* Profissional */}
      <div className="mt-5">
        <p className="text-xs uppercase tracking-wide text-bone-500">Profissional</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {loadingEligible && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-9 w-28" />)}
          {eligibleError && <ErrorState onRetry={() => refetchEligible()} />}
          {!loadingEligible &&
            !eligibleError &&
            eligibleEmployees?.map((employee) => (
              <button
                key={employee.id}
                onClick={() => selectEmployee(employee)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selectedEmployee?.id === employee.id
                    ? "border-crimson-500 bg-crimson-500/5 text-bone-50"
                    : "border-ink-700 text-bone-400 hover:border-gold-400/50",
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-ink-700 text-[10px] font-display text-gold-400">
                  {employee.photo_url ? (
                    <img src={employee.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(employee.first_name, employee.last_name)
                  )}
                </span>
                {employeeName(employee)}
                {scheduling.employee.id === employee.id && " (atual)"}
              </button>
            ))}
          {!loadingEligible && !eligibleError && (eligibleEmployees?.length ?? 0) === 0 && (
            <p className="flex items-center gap-2 text-xs text-bone-600">
              <Users className="h-3.5 w-3.5" /> Nenhum profissional com vaga livre pra esse serviço no momento.
            </p>
          )}
        </div>
      </div>

      {/* Data */}
      {selectedEmployee && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-bone-500">Data</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => {
              const dayStr = day.toISOString().slice(0, 10);
              const isSelected = selectedDateStr === dayStr;
              const hasSlots = calendar.daysWithAvailability.has(dayStr);
              const stillChecking = calendar.isLoading && !calendar.daysWithAvailability.size;
              const disabled = !stillChecking && !hasSlots && !calendar.isError;
              return (
                <button
                  key={dayStr}
                  onClick={() => !disabled && selectDay(day)}
                  disabled={disabled}
                  className={cn(
                    "flex w-14 shrink-0 flex-col items-center rounded-card border py-2 transition-colors",
                    isSelected ? "border-crimson-500 bg-crimson-500/10" : "border-ink-700 hover:border-gold-400/40",
                    disabled && "cursor-not-allowed border-ink-800 opacity-30 hover:border-ink-800",
                  )}
                >
                  <span className="text-[10px] uppercase text-bone-500">
                    {day.toLocaleDateString("pt-BR", { weekday: "short" })}
                  </span>
                  <span className="mt-1 font-display text-base text-bone-50">{day.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* Horário */}
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2">
            {calendar.isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            {calendar.isError && (
              <div className="col-span-full">
                <ErrorState onRetry={() => calendar.refetch()} />
              </div>
            )}
            {!calendar.isLoading && !calendar.isError && noAvailabilityInWindow && (
              <div className="col-span-full">
                <EmptyState
                  icon={CalendarClock}
                  title="Sem horários livres"
                  description="Não há vagas nos próximos dias. Tente escolher outro profissional."
                />
              </div>
            )}
            {!calendar.isLoading && !calendar.isError && selectedDate && slotsForSelectedDate.length === 0 && (
              <div className="col-span-full">
                <EmptyState icon={CalendarClock} title="Sem horários livres" description="Tente escolher outra data." />
              </div>
            )}
            {!calendar.isLoading &&
              !calendar.isError &&
              slotsForSelectedDate.map((slot) => (
                <button
                  key={slot.start}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "rounded-card border py-2 text-sm transition-colors",
                    selectedSlot?.start === slot.start
                      ? "border-crimson-500 bg-crimson-500/5 text-bone-50"
                      : "border-ink-700 text-bone-200 hover:border-gold-400 hover:text-gold-400",
                  )}
                >
                  {formatTime(slot.start)}
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3 border-t border-ink-700 pt-5">
        <Button type="button" variant="ghost" onClick={handleClose} disabled={reschedule.isPending}>
          Voltar
        </Button>
        <Button
          type="button"
          disabled={!selectedSlot}
          isLoading={reschedule.isPending}
          onClick={handleConfirm}
        >
          Confirmar novo horário
        </Button>
      </div>
    </Modal>
  );
}