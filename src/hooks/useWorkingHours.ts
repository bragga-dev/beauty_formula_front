import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workingHoursService, type WorkingHoursInput } from "@/services/working-hours.service";

export function useWorkingHours() {
  return useQuery({
    queryKey: ["my-working-hours"],
    queryFn: () => workingHoursService.listMine(),
  });
}

export function useWorkingHoursMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["my-working-hours"] });

  const create = useMutation({
    mutationFn: (payload: WorkingHoursInput) => workingHoursService.create(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<WorkingHoursInput> }) =>
      workingHoursService.update(id, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => workingHoursService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
