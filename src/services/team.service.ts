import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { EmployeeOut, EmployeeAdminUpdateInput, EmployeeTeamOut, EmployeeTeamDetailOut } from "@/types/employee";
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

  /** Admin atualiza os dados de perfil de um funcionário. */
  updateEmployeeProfile: (employeeId: string, payload: EmployeeAdminUpdateInput) =>
    api
      .patch<EmployeeOut>(`/employees/team/${employeeId}/profile`, payload)
      .then((r) => r.data),

  /** Admin substitui a foto de um funcionário. */
  updateEmployeePhoto: (employeeId: string, file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api
      .post<EmployeeOut>(`/employees/team/${employeeId}/photo`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};