import { api } from "./api";
import type { EmployeeWorkingHoursOut } from "@/types/schedule";

export interface WorkingHoursInput {
  weekday: number;
  start_time: string;
  end_time: string;
}

export const workingHoursService = {
  listMine: () => api.get<EmployeeWorkingHoursOut[]>("/employee-working-hours/list-my-working-hours").then((r) => r.data),

  create: (payload: WorkingHoursInput) =>
    api.post<EmployeeWorkingHoursOut>("/employee-working-hours/", payload).then((r) => r.data),

  update: (id: string, payload: Partial<WorkingHoursInput>) =>
    api.patch<EmployeeWorkingHoursOut>(`/employee-working-hours/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/employee-working-hours/${id}`),
};
