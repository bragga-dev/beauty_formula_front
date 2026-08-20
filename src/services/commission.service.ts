import { api } from "./api";
import type { PageOut } from "@/types/common";
import type {
  CommissionBulkMarkPaidInput,
  CommissionBulkMarkPaidOut,
  CommissionBulkStatusInput,
  CommissionBulkStatusOut,
  CommissionCreateInput,
  CommissionFilters,
  CommissionOut,
  CommissionTotalsOut,
  CommissionUpdateValueInput,
} from "@/types/commission";

/**
 * Consome a app `payment` do backend (model `EmployeeCommission`, router
 * montado em `/commissions/`). Ver
 * `beauty_formula/apps/payment/api/employee_commission.py`.
 */
export const commissionService = {
  // ═══════════════════════════════════════════════════════════════
  // Admin — geração manual (caso excepcional; o fluxo normal é
  // automático, disparado pelo backend quando o atendimento é
  // concluído — ver `generate_commission_for_completed_scheduling`)
  // ═══════════════════════════════════════════════════════════════

  /** Gera a comissão de UM atendimento concluído (valor calculado automaticamente). */
  create: (payload: CommissionCreateInput) =>
    api.post<CommissionOut>("/commissions/create", payload).then((r) => r.data),

  // ═══════════════════════════════════════════════════════════════
  // Admin — listagem / detalhe / edição pontual
  // ═══════════════════════════════════════════════════════════════

  listAll: (filters: CommissionFilters, page = 1, pageSize = 10) =>
    api
      .get<PageOut<CommissionOut>>("/commissions/list-all", {
        params: {
          page,
          page_size: pageSize,
          employee_id: filters.employeeId || undefined,
          status: filters.status || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        },
      })
      .then((r) => r.data),

  getDetail: (commissionId: string) =>
    api.get<CommissionOut>(`/commissions/${commissionId}`).then((r) => r.data),

  /** Soma das comissões por status (pendente/paga/cancelada), com os mesmos filtros da listagem. */
  getTotals: (filters: Pick<CommissionFilters, "employeeId" | "startDate" | "endDate">) =>
    api
      .get<CommissionTotalsOut>("/commissions/summary", {
        params: {
          employee_id: filters.employeeId || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        },
      })
      .then((r) => r.data),

  updateValue: (commissionId: string, payload: CommissionUpdateValueInput) =>
    api
      .patch<CommissionOut>(`/commissions/update-value/${commissionId}`, {
        commission_value: payload.commission_value,
      })
      .then((r) => r.data),

  // ═══════════════════════════════════════════════════════════════
  // Admin — status (individual e em lote)
  // ═══════════════════════════════════════════════════════════════

  markAsPaid: (commissionId: string) =>
    api.patch<CommissionOut>(`/commissions/mark-as-paid/${commissionId}`).then((r) => r.data),

  /** Marca como pagas várias comissões escolhidas manualmente (checkbox na tabela) de uma vez. */
  markManyAsPaid: (payload: CommissionBulkMarkPaidInput) =>
    api
      .patch<CommissionBulkMarkPaidOut>("/commissions/mark-as-paid-bulk", {
        commission_ids: payload.commissionIds,
      })
      .then((r) => r.data),

  /** Reverte uma comissão paga por engano de volta pra pendente. */
  revertToPending: (commissionId: string) =>
    api.patch<CommissionOut>(`/commissions/revert-to-pending/${commissionId}`).then((r) => r.data),

  cancel: (commissionId: string) =>
    api.patch<CommissionOut>(`/commissions/cancel/${commissionId}`).then((r) => r.data),

  updateStatusForPeriod: (payload: CommissionBulkStatusInput) =>
    api
      .patch<CommissionBulkStatusOut>("/commissions/update-status-period", {
        employee_id: payload.employeeId || undefined,
        start_date: payload.startDate,
        end_date: payload.endDate,
        status: payload.status,
      })
      .then((r) => r.data),

  // ═══════════════════════════════════════════════════════════════
  // Funcionário — somente leitura
  // ═══════════════════════════════════════════════════════════════

  listMine: (filters: { status?: CommissionFilters["status"]; startDate?: string; endDate?: string }, page = 1, pageSize = 10) =>
    api
      .get<PageOut<CommissionOut>>("/commissions/my-commissions/list", {
        params: {
          page,
          page_size: pageSize,
          status: filters.status || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        },
      })
      .then((r) => r.data),

  getMine: (commissionId: string) =>
    api.get<CommissionOut>(`/commissions/my-commissions/${commissionId}`).then((r) => r.data),

  /** Soma das próprias comissões por status. */
  getMyTotals: (filters: { startDate?: string; endDate?: string }) =>
    api
      .get<CommissionTotalsOut>("/commissions/my-commissions/summary", {
        params: {
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        },
      })
      .then((r) => r.data),
};