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
  // Invalida "schedulings" (pra listagem "meus agendamentos") E
  // "availability" (pra recalcular o calendário) — sem isso, o horário
  // que acabou de ser reservado continua aparecendo como livre pro
  // próximo cliente que consultar a mesma data enquanto o cache local
  // não expirar. Um cancelamento também precisa disso: o horário
  // liberado deve voltar a aparecer na hora.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["schedulings"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

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