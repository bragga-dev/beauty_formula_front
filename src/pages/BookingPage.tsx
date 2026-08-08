import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarClock,
  Clock,
  Star,
  Users,
  ArrowLeft,
  ArrowRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import { BookingSteps } from "@/features/booking/BookingSteps";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePublicServices } from "@/hooks/useServices";
import { useTeam } from "@/hooks/useTeam";
import { useEligibleEmployees } from "@/hooks/useAvailability";
import { useCalendarAvailability, type AggregatedSlot } from "@/hooks/useCalendarAvailability";
import { useSchedulingMutations } from "@/hooks/useScheduling";
import { useAuth } from "@/app/providers/auth-context";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDuration, formatTime, initials } from "@/utils/format";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
import type { ServiceOut } from "@/types/service";
import type { EmployeeTeamOut } from "@/types/employee";
import type { ApiError } from "@/types/common";

// Janela de dias mostrada no calendário — os 30 dias inteiros de uma vez
// (mesmo teto de disponibilidade calculado no backend, MAX_DAYS_AHEAD =
// 30). A faixa de dias rola horizontalmente em vez de carregar aos poucos.
const DAYS_WINDOW = 30;

function nextDays(count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function employeeName(employee: EmployeeTeamOut): string {
  return [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Profissional";
}

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { push } = useToast();
  const { create } = useSchedulingMutations();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceOut | null>(null);

  // Profissional: `null` + `isAnyProfessional=true` = "Qualquer profissional"
  // (o sistema atribui automaticamente ao confirmar o horário escolhido).
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeTeamOut | null>(null);
  const [isAnyProfessional, setIsAnyProfessional] = useState(false);
  // true quando o profissional já veio definido por um link direto
  // ("agendar com este profissional" no perfil dele) — pula a Etapa 2.
  const [employeeLocked, setEmployeeLocked] = useState(false);

  // `null` = ainda não escolhida / precisa ser recalculada (dispara a
  // seleção automática do primeiro dia com vaga real).
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  const preselectServiceId = searchParams.get("service");
  const preselectEmployeeId = searchParams.get("employee");

  const { data: servicesPage, isLoading: loadingServices, isError: servicesError, refetch: refetchServices } =
    usePublicServices(1, 50);

  // Etapa 2 — lista "de verdade": só quem atende o serviço E tem vaga
  // real na janela de agendamento.
  const {
    data: eligibleEmployees,
    isLoading: loadingEligible,
    isError: eligibleError,
    refetch: refetchEligible,
  } = useEligibleEmployees(selectedService?.id);

  // Usado só pro deep-link "agendar com este profissional" (pode incluir
  // alguém sem vaga imediata — nesse caso a Etapa 3 mostra "sem horários").
  const { data: teamPage } = useTeam(1, 50, selectedService?.id);

  useEffect(() => {
    if (!selectedService && preselectServiceId && servicesPage) {
      const found = servicesPage.items.find((s) => s.id === preselectServiceId);
      if (found) {
        setSelectedService(found);
        setStep(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicesPage, preselectServiceId]);

  useEffect(() => {
    if (selectedService && !selectedEmployee && !employeeLocked && preselectEmployeeId && teamPage) {
      const found = teamPage.items.find((e) => e.id === preselectEmployeeId);
      if (found) {
        setSelectedEmployee(found);
        setIsAnyProfessional(false);
        setEmployeeLocked(true);
        setSelectedDate(null);
        setStep(3);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamPage, preselectEmployeeId, selectedService]);

  const days = useMemo(() => nextDays(DAYS_WINDOW), []);
  const isCalendarStep = step === 3;

  // Profissional(is) considerados no calendário: um só (fixo/escolhido)
  // ou todos os elegíveis, quando "Qualquer profissional" foi escolhido.
  const calendarEmployees = useMemo<EmployeeTeamOut[]>(() => {
    if (selectedEmployee) return [selectedEmployee];
    if (isAnyProfessional) return eligibleEmployees ?? [];
    return [];
  }, [selectedEmployee, isAnyProfessional, eligibleEmployees]);

  const calendar = useCalendarAvailability(
    isCalendarStep ? calendarEmployees : [],
    selectedService?.id,
    isCalendarStep ? days : [],
  );

  // Sempre que o dia ainda não foi definido (mudou profissional, ou
  // ainda não houve seleção), escolhe automaticamente o primeiro dia com
  // vaga real assim que os dados chegarem — nada de calendário "pré-
  // montado" com o dia de hoje mesmo sem disponibilidade.
  useEffect(() => {
    if (!isCalendarStep || selectedDate || calendar.isLoading || calendar.isError) return;
    const firstAvailable = calendar.days.find((d) => d.slots.length > 0);
    if (firstAvailable) {
      setSelectedDate(new Date(`${firstAvailable.date}T00:00:00`));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalendarStep, selectedDate, calendar.isLoading, calendar.isError, calendar.days]);

  const selectedDateStr = selectedDate ? selectedDate.toISOString().slice(0, 10) : undefined;
  const slotsForSelectedDate = selectedDateStr ? calendar.slotsForDate(selectedDateStr) : [];
  const noAvailabilityInWindow = !calendar.isLoading && !calendar.isError && !selectedDate;

  function goToStep(n: number) {
    setStep(n);
  }

  function selectService(service: ServiceOut) {
    setSelectedService(service);
    setSelectedEmployee(null);
    setIsAnyProfessional(false);
    setEmployeeLocked(false);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(2);
  }

  // Etapa 2 → 3: escolher um profissional específico recalcula data e
  // horário do zero.
  function selectEmployee(employee: EmployeeTeamOut) {
    setSelectedEmployee(employee);
    setIsAnyProfessional(false);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(3);
  }

  function selectAnyProfessional() {
    setSelectedEmployee(null);
    setIsAnyProfessional(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    setStep(3);
  }

  // Trocar de dia só invalida o horário — o dia em si já é recalculado
  // pelo `useCalendarAvailability` a cada render.
  function selectDay(day: Date) {
    setSelectedDate(day);
    setSelectedSlot(null);
  }

  // Escolher o horário: se "Qualquer profissional" está ativo, o
  // sistema atribui automaticamente o primeiro profissional livre
  // naquele slot (slot.employees já vem ordenado pela API de "Nosso
  // Time").
  function selectSlot(slot: AggregatedSlot) {
    if (isAnyProfessional && !selectedEmployee) {
      const assigned = slot.employees[0];
      if (!assigned) return;
      setSelectedEmployee(assigned);
    }
    setSelectedSlot({ start: slot.start, end: slot.end });
    setStep(4);
  }

  function backToProfessionalStep() {
    setSelectedSlot(null);
    setStep(2);
  }

  function backToDateStep() {
    setSelectedSlot(null);
    if (isAnyProfessional) setSelectedEmployee(null);
    setStep(3);
  }

  function goToLogin() {
    const params = new URLSearchParams();
    if (selectedService) params.set("service", selectedService.id);
    if (selectedEmployee) params.set("employee", selectedEmployee.id);
    const from = { pathname: `${ROUTES.booking}?${params.toString()}` };
    navigate(ROUTES.login, { state: { from } });
  }

  async function handleConfirm() {
    if (!selectedService || !selectedEmployee || !selectedSlot) return;
    try {
      await create.mutateAsync({
        service_id: selectedService.id,
        employee_id: selectedEmployee.id,
        scheduled_time: selectedSlot.start,
      });
      setConfirmedAt(selectedSlot.start);
      push("Agendamento confirmado!", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <span className="text-xs uppercase tracking-widest text-crimson-400">Agendamento</span>
      <h1 className="mt-2 text-4xl">Escolha seu serviço e horário</h1>
      <p className="mt-2 max-w-lg text-bone-500">É rápido, fácil e prático!</p>

      <div className="mt-8 overflow-x-auto pb-2">
        <BookingSteps current={step} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          {/* Etapa 1 — Serviço */}
          {step === 1 && (
            <div className="space-y-3">
              {loadingServices && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              {servicesError && <ErrorState onRetry={() => refetchServices()} />}
              {servicesPage?.items.map((service) => (
                <button
                  key={service.id}
                  onClick={() => selectService(service)}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 rounded-card border p-4 text-left transition-colors",
                    selectedService?.id === service.id
                      ? "border-crimson-500 bg-crimson-500/5"
                      : "border-ink-700 bg-ink-800/60 hover:border-gold-400/50",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm uppercase tracking-wide text-bone-50">{service.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-bone-500">
                      <Clock className="h-3.5 w-3.5 shrink-0" /> {formatDuration(service.duration_minutes)}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-crimson-400">{formatCurrencyBRL(service.price)}</span>
                </button>
              ))}
              {preselectServiceId && !selectedService && (
                <p className="text-xs text-bone-600">Dica: selecione o serviço destacado no link que você acessou.</p>
              )}
            </div>
          )}

          {/* Etapa 2 — Profissional (só quem atende o serviço E tem vaga real) */}
          {step === 2 && (
            <div className="space-y-3">
              {loadingEligible && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              {eligibleError && <ErrorState onRetry={() => refetchEligible()} />}

              {!loadingEligible && !eligibleError && (eligibleEmployees?.length ?? 0) === 0 && (
                <EmptyState
                  icon={Star}
                  title="Nenhum profissional disponível"
                  description="No momento ninguém tem horário livre pra esse serviço. Tente novamente mais tarde ou escolha outro serviço."
                />
              )}

              {!loadingEligible && !eligibleError && (eligibleEmployees?.length ?? 0) > 0 && (
                <>
                  <button
                    onClick={selectAnyProfessional}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-card border p-4 text-left transition-colors",
                      isAnyProfessional
                        ? "border-crimson-500 bg-crimson-500/5"
                        : "border-ink-700 bg-ink-800/60 hover:border-gold-400/50",
                    )}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-700 text-gold-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm uppercase tracking-wide text-bone-50">Qualquer profissional</p>
                      <p className="truncate text-xs text-bone-500">
                        O sistema encontra o primeiro horário livre entre todos os profissionais disponíveis.
                      </p>
                    </div>
                  </button>

                  {eligibleEmployees?.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => selectEmployee(employee)}
                      className={cn(
                        "flex w-full items-center gap-4 rounded-card border p-4 text-left transition-colors",
                        !isAnyProfessional && selectedEmployee?.id === employee.id
                          ? "border-crimson-500 bg-crimson-500/5"
                          : "border-ink-700 bg-ink-800/60 hover:border-gold-400/50",
                      )}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-700 font-display text-gold-400">
                        {employee.photo_url ? (
                          <img src={employee.photo_url} alt={employeeName(employee)} className="h-full w-full object-cover" />
                        ) : (
                          initials(employee.first_name, employee.last_name)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm uppercase tracking-wide text-bone-50">
                          {employeeName(employee)}
                        </p>
                        {employee.bio && <p className="truncate text-xs text-bone-500">{employee.bio}</p>}
                      </div>
                    </button>
                  ))}
                </>
              )}

              <Button variant="ghost" size="sm" className="mt-2" onClick={() => goToStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            </div>
          )}

          {/* Etapa 3 — Data e horário (calendário dinâmico: só dias/horários com vaga real) */}
          {step === 3 && (
            <div>
              {(employeeLocked || selectedEmployee || isAnyProfessional) && (
                <p className="mb-3 text-xs text-bone-500">
                  Mostrando a agenda de{" "}
                  <span className="text-gold-400">
                    {isAnyProfessional && !selectedEmployee ? "qualquer profissional disponível" : selectedEmployee ? employeeName(selectedEmployee) : ""}
                  </span>
                  .
                </p>
              )}

              <div className="mb-1 flex gap-2 overflow-x-auto pb-3">
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
                        "flex w-14 shrink-0 flex-col items-center rounded-card border py-2.5 transition-colors sm:w-16",
                        isSelected ? "border-crimson-500 bg-crimson-500/10" : "border-ink-700 hover:border-gold-400/40",
                        disabled && "cursor-not-allowed border-ink-800 opacity-30 hover:border-ink-800",
                      )}
                    >
                      <span className="text-[10px] uppercase text-bone-500">
                        {day.toLocaleDateString("pt-BR", { weekday: "short" })}
                      </span>
                      <span className="mt-1 font-display text-lg text-bone-50">{day.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mb-3 text-[11px] text-bone-600">Arraste para o lado para ver os próximos 30 dias.</p>

              <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))] gap-2">
                {calendar.isLoading &&
                  Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
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
                      actionLabel="Escolher outro profissional"
                      onAction={backToProfessionalStep}
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
                      onClick={() => selectSlot(slot)}
                      className="rounded-card border border-ink-700 py-2.5 text-sm text-bone-200 transition-colors hover:border-gold-400 hover:text-gold-400"
                    >
                      {formatTime(slot.start)}
                    </button>
                  ))}
              </div>

              <Button variant="ghost" size="sm" className="mt-5" onClick={backToProfessionalStep}>
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            </div>
          )}

          {/* Etapa 4 — Confirmação */}
          {step === 4 && selectedSlot && (
            <div className="space-y-4">
              {confirmedAt ? (
                <div className="flex items-start gap-3 rounded-card border border-success-500/30 bg-success-500/10 p-4 text-sm text-bone-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-500" />
                  <div>
                    <p className="font-display text-sm uppercase tracking-wide text-bone-50">
                      Agendamento confirmado!
                    </p>
                    <p className="mt-1 text-bone-400">
                      Te esperamos {formatTime(confirmedAt)} do dia{" "}
                      {new Date(confirmedAt).toLocaleDateString("pt-BR")}. Você pode acompanhar seus
                      agendamentos a qualquer momento no seu painel.
                    </p>
                  </div>
                </div>
              ) : !isAuthenticated ? (
                <div className="flex items-start gap-3 rounded-card border border-gold-400/30 bg-gold-400/5 p-4 text-sm text-bone-300">
                  <Info className="h-5 w-5 shrink-0 text-gold-400" />
                  <p>Faça login para confirmar seu agendamento — a seleção que você já fez fica guardada.</p>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-card border border-ink-700 bg-ink-800/60 p-4 text-sm text-bone-300">
                  <Info className="h-5 w-5 shrink-0 text-gold-400" />
                  <p>Confira o resumo ao lado e confirme seu agendamento.</p>
                </div>
              )}
              {!confirmedAt && (
                <Button variant="ghost" size="sm" onClick={backToDateStep}>
                  <ArrowLeft className="h-4 w-4" /> Escolher outro horário
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Resumo */}
        <Card className="h-fit lg:sticky lg:top-24">
          <div className="p-5">
            <h3 className="font-display text-sm uppercase tracking-wide text-bone-50">Resumo do agendamento</h3>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase text-bone-600">Serviço</dt>
                <dd className="mt-0.5 text-bone-100">{selectedService?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-bone-600">Profissional</dt>
                <dd className="mt-0.5 text-bone-100">
                  {selectedEmployee
                    ? employeeName(selectedEmployee)
                    : isAnyProfessional
                      ? "Qualquer profissional"
                      : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-bone-600">Data</dt>
                <dd className="mt-0.5 text-bone-100">{step >= 3 && selectedDate ? selectedDate.toLocaleDateString("pt-BR") : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-bone-600">Horário</dt>
                <dd className="mt-0.5 text-bone-100">{selectedSlot ? formatTime(selectedSlot.start) : "—"}</dd>
              </div>
              <div className="border-t border-ink-700 pt-4">
                <dt className="text-xs uppercase text-bone-600">Valor</dt>
                <dd className="mt-0.5 font-display text-xl text-crimson-400">
                  {selectedService ? formatCurrencyBRL(selectedService.price) : "—"}
                </dd>
              </div>
            </dl>

            {confirmedAt ? (
              <Button fullWidth size="lg" className="mt-6" variant="outline" onClick={() => navigate(ROUTES.dashboard)}>
                Ver meu painel
              </Button>
            ) : !isAuthenticated && step === 4 ? (
              <Button fullWidth size="lg" className="mt-6" onClick={goToLogin}>
                Fazer login para confirmar
              </Button>
            ) : (
              <Button
                fullWidth
                size="lg"
                className="mt-6"
                disabled={!selectedSlot || !selectedEmployee || step < 4}
                isLoading={create.isPending}
                onClick={handleConfirm}
              >
                Confirmar Agendamento <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {!confirmedAt && (
              <p className="mt-2 text-center text-[11px] text-bone-600">
                Você pode cancelar gratuitamente até 2h antes do horário.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}