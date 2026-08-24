import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { EmployeeTeamOut, EmployeeTeamDetailOut } from "@/types/employee";
import type { EmployeeBookingWindowOut, EmployeeBookingWindowUpdateInput } from "@/types/employeeCalendar";

export const teamService = {
  list: (page = 1, page_size = 20, serviceId?: string) =>
    api
      .get<PageOut<EmployeeTeamOut>>("/employees/team", {
        params: { page, page_size, service_id: serviceId },
      })
      .then((r) => r.data),

  detail: (employeeId: string) =>
    api.get<EmployeeTeamDetailOut>(`/employees/team/${employeeId}`).then((r) => r.data),

  /** Admin ajusta a janela de agendamento (dias à frente) de um funcionário. */
  updateBookingWindow: (employeeId: string, payload: EmployeeBookingWindowUpdateInput) =>
    api
      .patch<EmployeeBookingWindowOut>(`/employees/team/${employeeId}/booking-window`, payload)
      .then((r) => r.data),
};