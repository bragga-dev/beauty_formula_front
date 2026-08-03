import type { ServiceOut } from "./service";
import type { EmployeeOut } from "./employee";
import type { UserOut, Gender } from "./user";

/**
 * Espelha `Scheduling.SchedulingStatus` do backend (app `services`,
 * model `Scheduling`). Não existe status "pendente" — todo agendamento
 * já nasce CONFIRMED (a disponibilidade é validada na criação).
 */
export type AppointmentStatus = "confirmed" | "completed" | "canceled" | "no_show" | "rescheduled";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  confirmed: "Confirmado",
  completed: "Concluído",
  canceled: "Cancelado",
  no_show: "Não compareceu",
  rescheduled: "Reagendado",
};

export const APPOINTMENT_STATUS_BADGE: Record<
  AppointmentStatus,
  "neutral" | "success" | "danger" | "gold" | "crimson"
> = {
  confirmed: "crimson",
  completed: "success",
  canceled: "danger",
  no_show: "neutral",
  rescheduled: "gold",
};

/** Filtro usado na listagem — inclui "all" além dos status reais da API. */
export type AppointmentFilter = "all" | AppointmentStatus;

/**
 * `client` do agendamento (schema `ClientOut` do backend). Não é
 * exibido nas telas do cliente (é o próprio usuário logado), mas faz
 * parte da resposta da API.
 */
export interface AppointmentClientOut {
  id: string;
  user: UserOut;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  instagram?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  gender: Gender;
  gender_label: string;
  birth_date?: string | null;
}

/**
 * Corresponde ao schema `SchedulingOut` do backend
 * (`beauty_formula.apps.services.schemas.scheduling_schema`).
 */
export interface AppointmentOut {
  id: string;
  service: ServiceOut;
  client: AppointmentClientOut;
  employee: EmployeeOut;
  scheduled_time: string;
  status: AppointmentStatus;
  price_at_booking: string;
  /** Duração em minutos (já convertida pelo backend a partir do DurationField). */
  duration_at_booking: number;
  notes?: string | null;
  canceled_at?: string | null;
  canceled_reason?: string | null;
  canceled_by?: UserOut | null;
  rated_at?: string | null;
  rescheduled_to_id?: string | null;
  created_at: string;
  updated_at: string;
}

/** Horário de término, calculado no front (a API só devolve o início + duração). */
export function getAppointmentEndTime(appointment: AppointmentOut): Date {
  return new Date(new Date(appointment.scheduled_time).getTime() + appointment.duration_at_booking * 60_000);
}

/**
 * Regra de cancelamento pelo cliente espelhando
 * `Scheduling.can_be_canceled_by_client`: só quando CONFIRMED e faltam
 * pelo menos 2h para o horário agendado. O backend não expõe esse
 * booleano pronto na API, então replicamos a regra aqui.
 */
export function canClientCancelAppointment(appointment: AppointmentOut): boolean {
  if (appointment.status !== "confirmed") return false;
  const hoursUntil = (new Date(appointment.scheduled_time).getTime() - Date.now()) / 3_600_000;
  return hoursUntil >= 2;
}