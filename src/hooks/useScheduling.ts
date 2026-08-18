import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schedulingService } from "@/services/scheduling.service";
import type {
  SchedulingCancelInput,
  SchedulingCreateInput,
  SchedulingFilter,
  SchedulingRescheduleInput,
  SchedulingUpdateInput,
} from "@/types/scheduling.types";

/**
 * `list-my-schedulings` não tem filtro por status no backend (só
 * `active_only`) — busca um lote (até o teto de 100 da API) e
 * filtra/pagina no front.
 */
export function useMySchedulings(filter: SchedulingFilter = "all", page = 1, pageSize = 10) {
  const query = useQuery({
    queryKey: ["schedulings", "mine"],
    queryFn: () => schedulingService.listMine(1, 100),
  });

  const filtered = query.data?.items.filter((s) => filter === "all" || s.status === filter) ?? [];
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    ...query,
    data: query.data ? { items, total, page, page_size: pageSize, pages } : undefined,
  };
}

export function useScheduling(id?: string) {
  return useQuery({
    queryKey: ["scheduling", id],
    queryFn: () => schedulingService.getMine(id as string),
    enabled: !!id,
    // Enquanto aguarda pagamento (CREATED), repolla a cada 5s — a
    // confirmação normalmente chega pelo webhook da Asaas em background,
    // sem o cliente precisar recarregar a página. Pára sozinho assim que
    // o status sai de CREATED (confirmado, cancelado etc.).
    refetchInterval: (query) => (query.state.data?.status === "created" ? 5_000 : false),
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
    queryClient.invalidateQueries({ queryKey: ["scheduling"] });
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

  const reschedule = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchedulingRescheduleInput }) =>
      schedulingService.rescheduleMine(id, payload),
    onSuccess: invalidate,
  });

  const confirm = useMutation({
    mutationFn: (id: string) => schedulingService.confirmMine(id),
    onSuccess: invalidate,
  });

  return { create, cancel, reschedule, confirm };
}

// ═══════════════════════════════════════════════════════════════════
// Funcionário
// ═══════════════════════════════════════════════════════════════════

/**
 * `list-employee-schedulings` também não tem filtro por status — mesma
 * estratégia de `useMySchedulings`: busca um lote e filtra/pagina no front.
 */
export function useEmployeeSchedulings(filter: SchedulingFilter = "all", page = 1, pageSize = 10) {
  const query = useQuery({
    queryKey: ["schedulings", "employee"],
    queryFn: () => schedulingService.listForEmployee(1, 100),
  });

  const filtered = query.data?.items.filter((s) => filter === "all" || s.status === filter) ?? [];
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    ...query,
    data: query.data ? { items, total, page, page_size: pageSize, pages } : undefined,
  };
}

export function useEmployeeScheduling(id?: string) {
  return useQuery({
    queryKey: ["scheduling", "employee", id],
    queryFn: () => schedulingService.getForEmployee(id as string),
    enabled: !!id,
  });
}

export function useEmployeeSchedulingMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["schedulings"] });
    queryClient.invalidateQueries({ queryKey: ["scheduling"] });
  };

  const complete = useMutation({
    mutationFn: (id: string) => schedulingService.complete(id),
    onSuccess: invalidate,
  });

  const markNoShow = useMutation({
    mutationFn: (id: string) => schedulingService.markNoShow(id),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchedulingCancelInput }) =>
      schedulingService.cancelAsEmployee(id, payload),
    onSuccess: invalidate,
  });

  return { complete, markNoShow, cancel };
}

// ═══════════════════════════════════════════════════════════════════
// Admin
// ═══════════════════════════════════════════════════════════════════

export interface AdminSchedulingFilters {
  status?: SchedulingFilter;
  employeeId?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
}

export function useAdminSchedulings(filters: AdminSchedulingFilters, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["admin", "schedulings", filters, page, pageSize],
    queryFn: () =>
      schedulingService.listAll({
        page,
        page_size: pageSize,
        status: filters.status && filters.status !== "all" ? filters.status : undefined,
        employee_id: filters.employeeId || undefined,
        service_id: filters.serviceId || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
      }),
  });
}

export function useAdminScheduling(id?: string) {
  return useQuery({
    queryKey: ["admin", "scheduling", id],
    queryFn: () => schedulingService.getAdmin(id as string),
    enabled: !!id,
  });
}

export function useAdminSchedulingMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "schedulings"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "scheduling"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchedulingUpdateInput }) =>
      schedulingService.updateAsAdmin(id, payload),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SchedulingCancelInput }) =>
      schedulingService.cancelAsAdmin(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => schedulingService.removeAsAdmin(id),
    onSuccess: invalidate,
  });

  return { update, cancel, remove };
}