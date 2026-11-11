import { api } from "./api";
import type { ClientProfile, EmployeeProfile, Gender, ManagerProfile } from "@/types/user";
import type { ManagerOut, ManagerUpdateInput } from "@/types/manager";

export interface ClientUpdateInput {
  username?: string;
  first_name?: string;
  last_name?: string;
  gender?: Gender;
  phone?: string;
  birth_date?: string;
  instagram?: string;
}

export type EmployeeUpdateInput = ClientUpdateInput & { bio?: string };

// O backend devolve o ManagerOut completo (com `user` aninhado); o contexto
// de auth guarda só o perfil, igual ao ManagerProfileOut de /auth/me.
function toManagerProfile(m: ManagerOut): ManagerProfile {
  return { id: m.id, first_name: m.first_name, last_name: m.last_name, photo_url: m.photo_url };
}

export const profileService = {
  updateClient: (payload: ClientUpdateInput) =>
    api.patch<ClientProfile>("/auth/update-client-profile", payload).then((r) => r.data),

  updateEmployee: (payload: EmployeeUpdateInput) =>
    api.patch<EmployeeProfile>("/auth/update-employee-profile", payload).then((r) => r.data),

  uploadClientPhoto: (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api
      .post<ClientProfile>("/auth/upload-client-photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  deleteClientPhoto: () =>
    api.delete<ClientProfile>("/auth/delete-client-photo").then((r) => r.data),

  uploadEmployeePhoto: (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api
      .post<EmployeeProfile>("/auth/upload-employee-photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  deleteEmployeePhoto: () =>
    api.delete<EmployeeProfile>("/auth/delete-employee-photo").then((r) => r.data),

  // Gerente não tem rotas /auth/*-profile: edita o próprio registro em /managers/{id}.
  updateManager: (managerId: string, payload: ManagerUpdateInput) =>
    api.patch<ManagerOut>(`/managers/${managerId}`, payload).then((r) => toManagerProfile(r.data)),

  uploadManagerPhoto: (managerId: string, file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api
      .post<ManagerOut>(`/managers/${managerId}/photo`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => toManagerProfile(r.data));
  },
};