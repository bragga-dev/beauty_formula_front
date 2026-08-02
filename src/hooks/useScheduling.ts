import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schedulingService } from "@/services/scheduling.service";
import type { SchedulingCancelInput, SchedulingCreateInput } from "@/types/scheduling.types";

export function useMySchedulings(page = 1, pageSize = 20, activeOnly = false) {
  return useQuery({
    queryKey: ["schedulings", "mine", page, pageSize, activeOnly],
    queryFn: () => schedulingService.listMine(page, pageSize, activeOnly),
  });
}

export function useSchedulingMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["schedulings"] });

  const create = useMutation({
    mutationFn: (payload: SchedulingCreateInput) => schedulingService.create(payload),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchedulingCancelInput }) =>
      schedulingService.cancelMine(id, payload),
    onSuccess: invalidate,
  });

  return { create, cancel };
}