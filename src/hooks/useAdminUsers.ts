import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminUsersService } from "@/services/admin-users.service";
import type { UserRole } from "@/types/user";

interface AdminUsersFilters {
  search?: string;
  role?: UserRole | "";
  is_active?: boolean | "";
}

export function useAdminUsers(page: number, pageSize = 10, filters: AdminUsersFilters = {}) {
  return useQuery({
    queryKey: ["admin", "users", page, pageSize, filters],
    queryFn: () =>
      adminUsersService.list({
        page,
        page_size: pageSize,
        search: filters.search,
        role: filters.role || undefined,
        is_active: filters.is_active === "" ? undefined : filters.is_active,
      }),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const registerEmployee = useMutation({
    mutationFn: (email: string) => adminUsersService.registerEmployee(email),
    onSuccess: invalidate,
  });

  const promoteToEmployee = useMutation({
    mutationFn: (userId: string) => adminUsersService.promoteToEmployee(userId),
    onSuccess: invalidate,
  });

  const deactivate = useMutation({
    mutationFn: (userId: string) => adminUsersService.deactivate(userId),
    onSuccess: invalidate,
  });

  const reactivate = useMutation({
    mutationFn: (userId: string) => adminUsersService.reactivate(userId),
    onSuccess: invalidate,
  });

  return { registerEmployee, promoteToEmployee, deactivate, reactivate };
}