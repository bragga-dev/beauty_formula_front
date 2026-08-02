import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesService } from "@/services/services.service";
import type { ServiceCreateInput, ServiceUpdateInput } from "@/types/service";

export function useAdminServices(page: number, pageSize = 10) {
  return useQuery({
    queryKey: ["admin", "services", page, pageSize],
    queryFn: () => servicesService.listPrivate(page, pageSize),
  });
}

export function useServiceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "services"] });

  const create = useMutation({
    mutationFn: ({ payload, image }: { payload: ServiceCreateInput; image?: File | null }) =>
      servicesService.create(payload, image),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ServiceUpdateInput }) =>
      servicesService.update(id, payload),
    onSuccess: invalidate,
  });

  const updateImage = useMutation({
    mutationFn: ({ id, image }: { id: string; image: File }) =>
      servicesService.updateImage(id, image),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => servicesService.remove(id),
    onSuccess: invalidate,
  });

  const activate = useMutation({
    mutationFn: (id: string) => servicesService.activate(id),
    onSuccess: invalidate,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => servicesService.deactivate(id),
    onSuccess: invalidate,
  });

  return { create, update, updateImage, remove, activate, deactivate };
}