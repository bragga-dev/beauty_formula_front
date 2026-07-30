import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarClock, Clock, Star, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { BookingSteps } from "@/features/booking/BookingSteps";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePublicServices } from "@/hooks/useServices";
import { useTeam } from "@/hooks/useTeam";
import { useAvailability } from "@/hooks/useAvailability";
import { formatCurrencyBRL, formatDuration, formatTime, initials } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { ServiceOut } from "@/types/service";
import type { EmployeeTeamOut } from "@/types/employee";
import type { AvailabilitySlotOut } from "@/types/schedule";

function nextDays(count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function BookingPage() {
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceOut | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeTeamOut | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlotOut | null>(null);

  const preselectServiceId = searchParams.get("service");
  const preselectEmployeeId = searchParams.get("employee");

  const { data: servicesPage, isLoading: loadingServices, isError: servicesError, refetch: refetchServices } =
    usePublicServices(1, 50);
  const { data: teamPage, isLoading: loadingTeam, isError: teamError, refetch: refetchTeam } = useTeam(
    1,
    50,
    selectedService?.id,
  );

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
    if (selectedService && !selectedEmployee && preselectEmployeeId && teamPage) {
      const found = teamPage.items.find((e) => e.id === preselectEmployeeId);
      if (found) {
        setSelectedEmployee(found);
        setStep(3);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamPage, preselectEmployeeId, selectedService]);

  const dateStr = selectedDate.toISOString().slice(0, 10);
  const {
    data: slots,
    isLoading: loadingSlots,
    isError: slotsError,
    refetch: refetchSlots,
  } = useAvailability(selectedEmployee?.id, selectedService?.id, step === 3 ? dateStr : undefined);

  const days = useMemo(() => nextDays(14), []);

  function goToStep(n: number) {
    setStep(n);
  }

  function selectService(service: ServiceOut) {
    setSelectedService(service);
    setSelectedEmployee(null);
    setStep(2);
  }

  function selectEmployee(employee: EmployeeTeamOut) {
    setSelectedEmployee(employee);
    setStep(3);
  }

  function selectSlot(slot: AvailabilitySlotOut) {
    setSelectedSlot(slot);
    setStep(4);
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
        <div className="lg:col-span-2">
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
                  <div>
                    <p className="font-display text-sm uppercase tracking-wide text-bone-50">{service.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-bone-500">
                      <Clock className="h-3.5 w-3.5" /> {formatDuration(service.duration_minutes)}
                    </p>
                  </div>
                  <span className="font-display text-crimson-400">{formatCurrencyBRL(service.price)}</span>
                </button>
              ))}
              {preselectServiceId && !selectedService && (
                <p className="text-xs text-bone-600">Dica: selecione o serviço destacado no link que você acessou.</p>
              )}
            </div>
          )}

          {/* Etapa 2 — Profissional */}
          {step === 2 && (
            <div className="space-y-3">
              {loadingTeam && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              {teamError && <ErrorState onRetry={() => refetchTeam()} />}
              {!loadingTeam && teamPage?.items.length === 0 && (
                <EmptyState icon={Star} title="Nenhum profissional disponível" description="Ainda não há profissionais vinculados a este serviço." />
              )}
              {teamPage?.items.map((employee) => {
                const name = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Profissional";
                return (
                  <button
                    key={employee.id}
                    onClick={() => selectEmployee(employee)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-card border p-4 text-left transition-colors",
                      selectedEmployee?.id === employee.id
                        ? "border-crimson-500 bg-crimson-500/5"
                        : "border-ink-700 bg-ink-800/60 hover:border-gold-400/50",
                    )}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-700 font-display text-gold-400">
                      {employee.photo_url ? (
                        <img src={employee.photo_url} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        initials(employee.first_name, employee.last_name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm uppercase tracking-wide text-bone-50">{name}</p>
                      {employee.bio && <p className="truncate text-xs text-bone-500">{employee.bio}</p>}
                    </div>
                  </button>
                );
              })}
              <Button variant="ghost" size="sm" onClick={() => goToStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            </div>
          )}

          {/* Etapa 3 — Data e horário */}
          {step === 3 && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-3">
                {days.map((day) => {
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "flex w-16 shrink-0 flex-col items-center rounded-card border py-2.5 transition-colors",
                        isSelected ? "border-crimson-500 bg-crimson-500/10" : "border-ink-700 hover:border-gold-400/40",
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

              <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {loadingSlots && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
                {slotsError && (
                  <div className="col-span-full">
                    <ErrorState onRetry={() => refetchSlots()} />
                  </div>
                )}
                {!loadingSlots && !slotsError && slots?.length === 0 && (
                  <div className="col-span-full">
                    <EmptyState icon={CalendarClock} title="Sem horários livres" description="Tente escolher outra data." />
                  </div>
                )}
                {slots?.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => selectSlot(slot)}
                    className="rounded-card border border-ink-700 py-2.5 text-sm text-bone-200 transition-colors hover:border-gold-400 hover:text-gold-400"
                  >
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="mt-5" onClick={() => goToStep(2)}>
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            </div>
          )}

          {/* Etapa 4 — Confirmação (mock — sem endpoint de criação no backend ainda) */}
          {step === 4 && selectedSlot && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-card border border-gold-400/30 bg-gold-400/5 p-4 text-sm text-bone-300">
                <Info className="h-5 w-5 shrink-0 text-gold-400" />
                <p>
                  O agendamento online ainda está em fase final de implementação. Confira o resumo abaixo e
                  finalize pelo WhatsApp por enquanto — em breve você poderá confirmar direto por aqui.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => goToStep(3)}>
                <ArrowLeft className="h-4 w-4" /> Escolher outro horário
              </Button>
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
                    ? [selectedEmployee.first_name, selectedEmployee.last_name].filter(Boolean).join(" ")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-bone-600">Data</dt>
                <dd className="mt-0.5 text-bone-100">{step >= 3 ? selectedDate.toLocaleDateString("pt-BR") : "—"}</dd>
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

            <Button
              fullWidth
              size="lg"
              className="mt-6"
              disabled={!selectedSlot}
              title="Disponível em breve — finalize pelo WhatsApp por enquanto"
            >
              Confirmar Agendamento <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-2 text-center text-[11px] text-bone-600">
              Confirmação online chegando em breve.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
