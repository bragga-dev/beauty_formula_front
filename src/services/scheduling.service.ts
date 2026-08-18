import { api } from "./api";
import type {
  SchedulingCancelInput,
  SchedulingCreateInput,
  SchedulingOut,
  SchedulingPrivateOut,
  SchedulingRescheduleInput,
  SchedulingUpdateInput,
} from "@/types/scheduling.types";
import type { PageOut } from "@/types/common";

export interface AdminSchedulingListParams {
  page?: number;
  page_size?: number;
  service_id?: string;
  employee_id?: string;
  client_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export const schedulingService = {
  create: (payload: SchedulingCreateInput) =>
    api.post<SchedulingOut>("/scheduling/create", payload).then((r) => r.data),

  listMine: (page = 1, pageSize = 20, activeOnly = false) =>
    api
      .get<PageOut<SchedulingOut>>("/scheduling/list-my-schedulings", {
        params: { page, page_size: pageSize, active_only: activeOnly },
      })
      .then((r) => r.data),

  getMine: (schedulingId: string) =>
    api.get<SchedulingOut>(`/scheduling/my-schedulings/${schedulingId}`).then((r) => r.data),

  cancelMine: (schedulingId: string, payload: SchedulingCancelInput) =>
    api
      .patch<SchedulingOut>(`/scheduling/cancel-my-scheduling/${schedulingId}`, payload)
      .then((r) => r.data),

  /**
   * Reagendamento: não altera o registro atual (marcado como RESCHEDULED
   * no backend) — retorna o NOVO agendamento já CONFIRMED. Aceita trocar
   * serviço/funcionário opcionalmente, mas o uso padrão só manda o novo
   * `scheduled_time`.
   */
  rescheduleMine: (schedulingId: string, payload: SchedulingRescheduleInput) =>
    api
      .patch<SchedulingOut>(`/scheduling/reschedule-my-scheduling/${schedulingId}`, payload)
      .then((r) => r.data),

  /**
   * Confirmação manual (CREATED -> CONFIRMED) — fallback pro caso do
   * cliente já ter pago mas o webhook da Asaas ainda não ter processado.
   * Normalmente desnecessário: a confirmação acontece sozinha.
   */
  confirmMine: (schedulingId: string) =>
    api.patch<SchedulingOut>(`/scheduling/confirm-my-scheduling/${schedulingId}`).then((r) => r.data),

  // ═══════════════════════════════════════════════════════════════
  // Funcionário
  // ═══════════════════════════════════════════════════════════════

  listForEmployee: (page = 1, pageSize = 20, activeOnly = false) =>
    api
      .get<PageOut<SchedulingOut>>("/scheduling/list-employee-schedulings", {
        params: { page, page_size: pageSize, active_only: activeOnly },
      })
      .then((r) => r.data),

  getForEmployee: (schedulingId: string) =>
    api.get<SchedulingOut>(`/scheduling/employee-schedulings/${schedulingId}`).then((r) => r.data),

  complete: (schedulingId: string) =>
    api.patch<SchedulingOut>(`/scheduling/complete/${schedulingId}`).then((r) => r.data),

  markNoShow: (schedulingId: string) =>
    api.patch<SchedulingOut>(`/scheduling/no-show/${schedulingId}`).then((r) => r.data),

  cancelAsEmployee: (schedulingId: string, payload: SchedulingCancelInput) =>
    api
      .patch<SchedulingOut>(`/scheduling/cancel-employee-scheduling/${schedulingId}`, payload)
      .then((r) => r.data),

  // ═══════════════════════════════════════════════════════════════
  // Admin
  // ═══════════════════════════════════════════════════════════════

  listAll: (params: AdminSchedulingListParams) =>
    api.get<PageOut<SchedulingPrivateOut>>("/scheduling/list-all", { params }).then((r) => r.data),

  getAdmin: (schedulingId: string) =>
    api.get<SchedulingPrivateOut>(`/scheduling/${schedulingId}`).then((r) => r.data),

  updateAsAdmin: (schedulingId: string, payload: SchedulingUpdateInput) =>
    api.patch<SchedulingPrivateOut>(`/scheduling/update/${schedulingId}`, payload).then((r) => r.data),

  cancelAsAdmin: (schedulingId: string, payload: SchedulingCancelInput) =>
    api.patch<SchedulingPrivateOut>(`/scheduling/cancel/${schedulingId}`, payload).then((r) => r.data),

  removeAsAdmin: (schedulingId: string) => api.delete(`/scheduling/${schedulingId}`),
};