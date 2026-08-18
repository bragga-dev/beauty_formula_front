import { api } from "./api";
import type { ClientProfile, EmployeeProfile, Gender } from "@/types/user";

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
};