import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { EmployeeServiceOut } from "@/types/employee";

export const employeeServicesService = {
  listMine: (activeOnly = false, page = 1, page_size = 20) =>
    api
      .get<PageOut<EmployeeServiceOut>>("/employee-services/list-my-services", {
        params: { active_only: activeOnly, page, page_size },
      })
      .then((r) => r.data),

  create: (serviceId: string) =>
    api
      .post<EmployeeServiceOut>("/employee-services/create-employee-service", { service_id: serviceId })
      .then((r) => r.data),

  activate: (linkId: string) =>
    api.patch<EmployeeServiceOut>(`/employee-services/activate-employee-service/${linkId}`).then((r) => r.data),

  deactivate: (linkId: string) =>
    api.patch<EmployeeServiceOut>(`/employee-services/deactivate-employee-service/${linkId}`).then((r) => r.data),

  remove: (linkId: string) => api.delete(`/employee-services/delete-employee-service/${linkId}`),
};
