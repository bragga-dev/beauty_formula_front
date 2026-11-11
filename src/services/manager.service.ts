import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { ManagerCreateInput, ManagerOut, ManagerUpdateInput } from "@/types/manager";

export const managerService = {
  list: (page = 1, page_size = 20) =>
    api.get<PageOut<ManagerOut>>("/managers/", { params: { page, page_size } }).then((r) => r.data),

  detail: (managerId: string) => api.get<ManagerOut>(`/managers/${managerId}`).then((r) => r.data),

  /** Somente admin root. Não retorna tokens; a senha temporária é enviada por e-mail. */
  create: (payload: ManagerCreateInput) =>
    api.post<ManagerOut>("/managers/", payload).then((r) => r.data),

  update: (managerId: string, payload: ManagerUpdateInput) =>
    api.patch<ManagerOut>(`/managers/${managerId}`, payload).then((r) => r.data),

  uploadPhoto: (managerId: string, file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api
      .post<ManagerOut>(`/managers/${managerId}/photo`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  deletePhoto: (managerId: string) =>
    api.delete<ManagerOut>(`/managers/${managerId}/photo`).then((r) => r.data),

  remove: (managerId: string) => api.delete(`/managers/${managerId}`).then((r) => r.data),
};