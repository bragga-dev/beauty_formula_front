import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { UserAdminOut, UserRole } from "@/types/user";
import type { EmployeeOut } from "@/types/employee";

interface ListUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: UserRole;
  is_active?: boolean;
}

export const adminUsersService = {
  list: ({ page = 1, page_size = 20, search, role, is_active }: ListUsersParams = {}) =>
    api
      .get<PageOut<UserAdminOut>>("/admin/list-users", {
        params: { page, page_size, search: search || undefined, role: role || undefined, is_active },
      })
      .then((r) => r.data),

  detail: (userId: string) =>
    api.get<UserAdminOut>(`/admin/detail-user/${userId}`).then((r) => r.data),

  registerEmployee: (email: string) =>
    api.post("/auth/register-employee", { email }).then((r) => r.data),

  promoteToEmployee: (userId: string) =>
    api.post<EmployeeOut>(`/auth/promote-client-to-employee/${userId}`).then((r) => r.data),

  deactivate: (userId: string) =>
    api.post<UserAdminOut>(`/auth/deactive-user/${userId}`).then((r) => r.data),

  reactivate: (userId: string) =>
    api.post<UserAdminOut>(`/auth/reactivate-user/${userId}`).then((r) => r.data),
};