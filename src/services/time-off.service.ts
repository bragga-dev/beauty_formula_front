import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { EmployeeTimeOffOut, BlockType } from "@/types/schedule";

export interface RecurringTimeOffInput {
  block_type: BlockType;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface PunctualTimeOffInput {
  block_type: BlockType;
  start_datetime: string;
  end_datetime: string;
}

export type TimeOffInput =
  | ({ mode: "recurring" } & RecurringTimeOffInput)
  | ({ mode: "punctual" } & PunctualTimeOffInput);

// O back-end tem duas rotas de criação/edição exclusivas (recorrente x
// pontual, cada uma com seu próprio schema) — não existe um POST/PATCH
// genérico em "/employee-time-off/". Precisa rotear pelo "mode" pra
// bater com a rota certa, senão cai em 404 e o bloqueio nunca é salvo.
export const timeOffService = {
  listMine: (page = 1, page_size = 20) =>
    api
      .get<PageOut<EmployeeTimeOffOut>>("/employee-time-off/list-my-time-off", { params: { page, page_size } })
      .then((r) => r.data),

  create: (payload: TimeOffInput) => {
    const { mode, ...body } = payload;
    const path = mode === "recurring" ? "/employee-time-off/recurring/" : "/employee-time-off/punctual/";
    return api.post<EmployeeTimeOffOut>(path, body).then((r) => r.data);
  },

  update: (id: string, mode: "recurring" | "punctual", payload: Partial<RecurringTimeOffInput | PunctualTimeOffInput>) => {
    const path = mode === "recurring" ? `/employee-time-off/recurring/${id}` : `/employee-time-off/punctual/${id}`;
    return api.patch<EmployeeTimeOffOut>(path, payload).then((r) => r.data);
  },

  remove: (id: string) => api.delete(`/employee-time-off/${id}`),
};