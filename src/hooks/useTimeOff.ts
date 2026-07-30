import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { timeOffService, type TimeOffInput } from "@/services/time-off.service";

export function useTimeOff(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ["my-time-off", page, pageSize],
    queryFn: () => timeOffService.listMine(page, pageSize),
  });
}

export function useTimeOffMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["my-time-off"] });

  const create = useMutation({
    mutationFn: (payload: TimeOffInput) => timeOffService.create(payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => timeOffService.remove(id),
    onSuccess: invalidate,
  });

  return { create, remove };
}
