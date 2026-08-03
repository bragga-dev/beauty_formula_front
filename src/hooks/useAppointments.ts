import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "@/services/appointments.service";
import type { AppointmentFilter } from "@/types/appointment";

/**
 * `list-my-schedulings` não tem filtro por status no backend — busca um
 * lote (até o teto de 100 da API) e filtra/pagina no front.
 */
export function useMyAppointments(filter: AppointmentFilter = "all", page = 1, pageSize = 10) {
  const query = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => appointmentsService.listMine(1, 100),
  });

  const filtered = query.data?.items.filter((a) => filter === "all" || a.status === filter) ?? [];
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    ...query,
    data: query.data ? { items, total, page, page_size: pageSize, pages } : undefined,
  };
}

export function useAppointment(id?: string) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointmentsService.get(id as string),
    enabled: !!id,
  });
}

export function useAppointmentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    queryClient.invalidateQueries({ queryKey: ["appointment"] });
  };

  const cancel = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => appointmentsService.cancel(id, reason),
    onSuccess: invalidate,
  });

  return { cancel };
}