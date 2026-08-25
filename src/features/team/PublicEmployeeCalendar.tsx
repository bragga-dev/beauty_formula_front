import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Ban, CalendarDays, CheckCircle2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePublicEmployeeCalendar } from "@/hooks/useAvailability";
import { cn } from "@/utils/cn";
import type { PublicEmployeeCalendarDayOut } from "@/types/employeeCalendar";

interface PublicEmployeeCalendarProps {
  employeeId: string;
}

const WEEKDAY_HEADERS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function monthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function timeLabel(value: string): string {
  // "09:00:00" -> "09:00"
  return value.slice(0, 5);
}

export function PublicEmployeeCalendar({ employeeId }: PublicEmployeeCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const month = monthKey(cursor);
  const { data: calendar, isLoading, isError, refetch } = usePublicEmployeeCalendar(employeeId, month);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const leadingBlanks = calendar ? calendar.days[0].weekday : 0;

  const selectedDay: PublicEmployeeCalendarDayOut | undefined = calendar?.days.find((d) => d.date === selectedDate);

  function goToMonth(offset: number) {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    setSelectedDate(null);
  }

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gold-400" />
          <h2 className="text-xl capitalize">{monthLabel(cursor)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => goToMonth(-1)} aria-label="Mês anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => goToMonth(1)} aria-label="Próximo mês">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        {isError ? (
          <ErrorState message="Não foi possível carregar a agenda deste profissional." onRetry={() => refetch()} />
        ) : isLoading || !calendar ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-bone-600">
              {WEEKDAY_HEADERS.map((label) => (
                <div key={label} className="py-1">
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}

              {calendar.days.map((day) => {
                const dayNumber = Number(day.date.slice(8, 10));
                const isToday = day.date === todayISO;
                const isSelected = day.date === selectedDate;
                const isBlocked = day.time_off_blocks.length > 0 && day.working_hours.length === 0;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : day.date)}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-card border text-sm transition-colors",
                      day.working_hours.length === 0
                        ? "border-transparent text-bone-700"
                        : "border-ink-700 text-bone-200 hover:border-gold-400",
                      !day.is_within_booking_window && "opacity-40",
                      isSelected && "border-gold-400 bg-ink-700",
                      isToday && !isSelected && "border-bone-500/60",
                    )}
                  >
                    <span className={cn(isToday && "font-semibold text-gold-400")}>{dayNumber}</span>
                    <div className="flex h-1.5 items-center gap-0.5">
                      {day.has_open_slots && <span className="h-1.5 w-1.5 rounded-full bg-success-500/60" />}
                      {isBlocked && <span className="h-1.5 w-1.5 rounded-full bg-danger-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-bone-500">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success-500/60" /> Com horário livre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-danger-500" /> Bloqueado o dia todo
              </span>
              <span>Dias apagados ficam fora da janela de agendamento atual</span>
            </div>

            {selectedDay && (
              <div className="mt-6 rounded-card border border-ink-700 bg-ink-900/40 p-4">
                <p className="font-display text-sm uppercase tracking-wide text-bone-50">
                  {new Date(`${selectedDay.date}T00:00:00`).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </p>

                {selectedDay.working_hours.length === 0 ? (
                  <p className="mt-3 text-sm text-bone-600">Sem expediente cadastrado para este dia da semana.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedDay.working_hours.map((wh, i) => (
                      <Badge key={i} variant="neutral">
                        <Clock className="h-3 w-3" /> {timeLabel(wh.start_time)} – {timeLabel(wh.end_time)}
                      </Badge>
                    ))}
                  </div>
                )}

                {selectedDay.time_off_blocks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedDay.time_off_blocks.map((block) => (
                      <Badge key={block.id} variant="danger">
                        <Ban className="h-3 w-3" />
                        {block.start_time && block.end_time
                          ? `${timeLabel(block.start_time)} – ${timeLabel(block.end_time)}`
                          : "Dia todo"}
                        {block.is_recurring ? " (recorrente)" : ""}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs uppercase tracking-wide text-bone-600">Horários livres</p>
                {selectedDay.free_intervals.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedDay.free_intervals.map((interval, i) => (
                      <Badge key={i} variant="success">
                        <CheckCircle2 className="h-3 w-3" />
                        {timeLabel(interval.start_time)} – {timeLabel(interval.end_time)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-bone-600">Nenhum horário livre neste dia.</p>
                )}
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}