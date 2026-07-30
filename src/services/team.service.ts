import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { EmployeeTeamOut, EmployeeTeamDetailOut } from "@/types/employee";

export const teamService = {
  list: (page = 1, page_size = 20, serviceId?: string) =>
    api
      .get<PageOut<EmployeeTeamOut>>("/employees/team", {
        params: { page, page_size, service_id: serviceId },
      })
      .then((r) => r.data),

  detail: (employeeId: string) =>
    api.get<EmployeeTeamDetailOut>(`/employees/team/${employeeId}`).then((r) => r.data),
};
