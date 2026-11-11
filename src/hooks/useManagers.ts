import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { managerService } from "@/services/manager.service";
import { adminUsersService } from "@/services/admin-users.service";
import type { ManagerCreateInput, ManagerUpdateInput } from "@/types/manager";

export function useManagers(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["admin", "managers", page, pageSize],
    queryFn: () => managerService.list(page, pageSize),
  });
}

export function useManagerMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "managers"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const create = useMutation({
    mutationFn: (payload: ManagerCreateInput) => managerService.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ managerId, payload }: { managerId: string; payload: ManagerUpdateInput }) =>
      managerService.update(managerId, payload),
    onSuccess: invalidate,
  });

  const uploadPhoto = useMutation({
    mutationFn: ({ managerId, file }: { managerId: string; file: File }) =>
      managerService.uploadPhoto(managerId, file),
    onSuccess: invalidate,
  });

  const deletePhoto = useMutation({
    mutationFn: (managerId: string) => managerService.deletePhoto(managerId),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (managerId: string) => managerService.remove(managerId),
    onSuccess: invalidate,
  });

  // (Des)ativar usa as rotas de /auth/ pelo id do USER, não do gerente.
  const deactivate = useMutation({
    mutationFn: (userId: string) => adminUsersService.deactivate(userId),
    onSuccess: invalidate,
  });

  const reactivate = useMutation({
    mutationFn: (userId: string) => adminUsersService.reactivate(userId),
    onSuccess: invalidate,
  });

  return { create, update, uploadPhoto, deletePhoto, remove, deactivate, reactivate };
}