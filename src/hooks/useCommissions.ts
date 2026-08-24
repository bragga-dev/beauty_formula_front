import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commissionService } from "@/services/commission.service";
import type {
  CommissionBulkMarkPaidInput,
  CommissionBulkStatusInput,
  CommissionFilters,
  CommissionUpdateCompetenciaInput,
  CommissionUpdateValueInput,
} from "@/types/commission";

// ═══════════════════════════════════════════════════════════════════
// Admin
// ═══════════════════════════════════════════════════════════════════

/**
 * Comissões filtradas — usada na aba de comissões do detalhe do
 * funcionário (sempre com `employeeId` fixo) e, potencialmente, numa
 * listagem geral no futuro.
 */
export function useCommissions(filters: CommissionFilters, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["commissions", "list", filters, page, pageSize],
    queryFn: () => commissionService.listAll(filters, page, pageSize),
  });
}

export function useCommissionDetail(commissionId?: string) {
  return useQuery({
    queryKey: ["commissions", "detail", commissionId],
    queryFn: () => commissionService.getDetail(commissionId as string),
    enabled: !!commissionId,
  });
}

/** Soma das comissões por status (pendente/paga/cancelada) — total a pagar ao funcionário. */
export function useCommissionTotals(
  filters: Pick<CommissionFilters, "employeeId" | "startDate" | "endDate" | "competencia">,
) {
  return useQuery({
    queryKey: ["commissions", "totals", filters],
    queryFn: () => commissionService.getTotals(filters),
  });
}

export function useCommissionMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["commissions"] });
  };

  const updateValue = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CommissionUpdateValueInput }) =>
      commissionService.updateValue(id, payload),
    onSuccess: invalidate,
  });

  const updateCompetencia = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CommissionUpdateCompetenciaInput }) =>
      commissionService.updateCompetencia(id, payload),
    onSuccess: invalidate,
  });

  const markAsPaid = useMutation({
    mutationFn: (id: string) => commissionService.markAsPaid(id),
    onSuccess: invalidate,
  });

  const markManyAsPaid = useMutation({
    mutationFn: (payload: CommissionBulkMarkPaidInput) => commissionService.markManyAsPaid(payload),
    onSuccess: invalidate,
  });

  const revertToPending = useMutation({
    mutationFn: (id: string) => commissionService.revertToPending(id),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => commissionService.cancel(id),
    onSuccess: invalidate,
  });

  const updateStatusForPeriod = useMutation({
    mutationFn: (payload: CommissionBulkStatusInput) => commissionService.updateStatusForPeriod(payload),
    onSuccess: invalidate,
  });

  return {
    updateValue,
    updateCompetencia,
    markAsPaid,
    markManyAsPaid,
    revertToPending,
    cancel,
    updateStatusForPeriod,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Funcionário
// ═══════════════════════════════════════════════════════════════════

export function useMyCommissions(
  filters: { status?: CommissionFilters["status"]; startDate?: string; endDate?: string },
  page = 1,
  pageSize = 10,
) {
  return useQuery({
    queryKey: ["commissions", "mine", filters, page, pageSize],
    queryFn: () => commissionService.listMine(filters, page, pageSize),
  });
}