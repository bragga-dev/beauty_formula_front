import { api } from "./api";
import type { SchedulingCancelInput, SchedulingCreateInput, SchedulingOut } from "@/types/scheduling.types";
import type { PageOut } from "@/types/common";

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
};