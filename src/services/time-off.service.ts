import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { EmployeeTimeOffOut, BlockType } from "@/types/schedule";

export interface TimeOffInput {
  block_type: BlockType;
  weekday?: number;
  start_time?: string;
  end_time?: string;
  start_datetime?: string;
  end_datetime?: string;
}

export const timeOffService = {
  listMine: (page = 1, page_size = 20) =>
    api
      .get<PageOut<EmployeeTimeOffOut>>("/employee-time-off/list-my-time-off", { params: { page, page_size } })
      .then((r) => r.data),

  create: (payload: TimeOffInput) => api.post<EmployeeTimeOffOut>("/employee-time-off/", payload).then((r) => r.data),

  update: (id: string, payload: Partial<TimeOffInput>) =>
    api.patch<EmployeeTimeOffOut>(`/employee-time-off/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/employee-time-off/${id}`),
};
