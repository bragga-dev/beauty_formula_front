import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeServicesService } from "@/services/employee-services.service";

export function useMyServices(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ["my-services", page, pageSize],
    queryFn: () => employeeServicesService.listMine(false, page, pageSize),
  });
}

export function useMyServiceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["my-services"] });

  const create = useMutation({
    mutationFn: (serviceId: string) => employeeServicesService.create(serviceId),
    onSuccess: invalidate,
  });
  const activate = useMutation({
    mutationFn: (id: string) => employeeServicesService.activate(id),
    onSuccess: invalidate,
  });
  const deactivate = useMutation({
    mutationFn: (id: string) => employeeServicesService.deactivate(id),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => employeeServicesService.remove(id),
    onSuccess: invalidate,
  });

  return { create, activate, deactivate, remove };
}
