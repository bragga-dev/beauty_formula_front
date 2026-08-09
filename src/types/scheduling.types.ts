import type { ServiceOut } from "./service";
import type { EmployeeOut } from "./employee";
import type { UserOut, Gender } from "./user";

export type SchedulingStatus = "confirmed" | "completed" | "canceled" | "no_show" | "rescheduled";

export const SCHEDULING_STATUS_LABELS: Record<SchedulingStatus, string> = {
  confirmed: "Confirmado",
  completed: "Concluído",
  canceled: "Cancelado",
  no_show: "Não compareceu",
  rescheduled: "Reagendado",
};

export const SCHEDULING_STATUS_BADGE: Record<
  SchedulingStatus,
  "neutral" | "success" | "danger" | "gold" | "crimson" | "info" | "purple" | "orange"
> = {
  confirmed: "info",
  completed: "success",
  canceled: "danger",
  no_show: "purple",
  rescheduled: "orange",
};

/** Filtro usado na listagem — inclui "all" além dos status reais da API. */
export type SchedulingFilter = "all" | SchedulingStatus;

/** Corresponde ao schema `ClientOut` do backend (accounts). */
export interface ClientOut {
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

export interface SchedulingOut {
  id: string;
  service: ServiceOut;
  client: ClientOut;
  employee: EmployeeOut;
  scheduled_time: string;
  status: SchedulingStatus;
  price_at_booking: string;
  duration_at_booking: number;
  notes?: string | null;
  canceled_at?: string | null;
  canceled_reason?: string | null;
  canceled_by?: UserOut | null;
  rescheduled_to_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchedulingCreateInput {
  service_id: string;
  employee_id: string;
  scheduled_time: string;
  notes?: string;
}

export interface SchedulingCancelInput {
  reason: string;
}

export interface SchedulingUpdateInput {
  service_id?: string;
  employee_id?: string;
  scheduled_time?: string;
  notes?: string;
}

/** Corresponde ao schema `SchedulingPrivateOut` do backend — visão administrativa. */
export interface SchedulingPrivateOut extends SchedulingOut {
  is_active: boolean;
}

/** Horário de término, calculado no front (a API só devolve o início + duração). */
export function getSchedulingEndTime(scheduling: SchedulingOut): Date {
  return new Date(new Date(scheduling.scheduled_time).getTime() + scheduling.duration_at_booking * 60_000);
}

/**
 * Regra de cancelamento pelo cliente espelhando
 * `Scheduling.can_be_canceled_by_client` no backend: só quando CONFIRMED
 * e faltam pelo menos 2h para o horário agendado. A API não expõe esse
 * booleano pronto, então replicamos a regra aqui.
 */
export function canClientCancelScheduling(scheduling: SchedulingOut): boolean {
  if (scheduling.status !== "confirmed") return false;
  const hoursUntil = (new Date(scheduling.scheduled_time).getTime() - Date.now()) / 3_600_000;
  return hoursUntil >= 2;
}

/**
 * Concluir, marcar não comparecimento e cancelar (pelo funcionário) só
 * são permitidos a partir de CONFIRMED — espelha `ALLOWED_TRANSITIONS`
 * e `can_be_canceled_by_admin` no backend. Sem a janela de 2h que vale
 * pro cancelamento do cliente.
 */
export function canEmployeeActOnScheduling(scheduling: SchedulingOut): boolean {
  return scheduling.status === "confirmed";
}

/**
 * Editar e cancelar como admin só valem com status CONFIRMED — espelha
 * `can_be_canceled_by_admin` e a checagem de `FINAL_STATUSES` em
 * `update_scheduling_by_admin` no backend (os dois coincidem, já que os
 * únicos status não-finais são CONFIRMED). Excluir permanentemente não
 * tem essa restrição.
 */
export function canAdminModifySchedule(scheduling: SchedulingOut): boolean {
  return scheduling.status === "confirmed";
}