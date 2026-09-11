import { api } from "./api";
import type { PageOut } from "@/types/common";
import type {
  CommissionBulkGenerateOut,
  CommissionBulkMarkPaidInput,
  CommissionBulkMarkPaidOut,
  CommissionBulkStatusInput,
  CommissionBulkStatusOut,
  CommissionFilters,
  CommissionOut,
  CommissionTotalsOut,
  CommissionUpdateCompetenciaInput,
  CommissionUpdateValueInput,
} from "@/types/commission";

/**
 * Consome a app `payment` do backend (model `EmployeeCommission`, router
 * montado em `/commissions/`). Ver
 * `beauty_formula/apps/payment/api/employee_commission.py`.
 *
 * A geração é automática por padrão (dispara sozinha no backend quando
 * um atendimento é concluído). `syncMissing` existe só como correção:
 * varre TODO o histórico (sem recorte de período) atrás de atendimento
 * COMPLETED sem comissão e gera. Idempotente — atendimento que já tem
 * comissão nem entra na varredura.
 */
export const commissionService = {
  /** Admin corrige o que porventura escapou da geração automática — sem filtro de data. */
  syncMissing: (employeeId?: string) =>
    api
      .post<CommissionBulkGenerateOut>("/commissions/sync", null, { params: employeeId ? { employee_id: employeeId } : {} })
      .then((r) => r.data),

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
          competencia: filters.competencia || undefined,
        },
      })
      .then((r) => r.data),

  getDetail: (commissionId: string) =>
    api.get<CommissionOut>(`/commissions/${commissionId}`).then((r) => r.data),

  /** Soma das comissões por status (pendente/paga/cancelada), com os mesmos filtros da listagem. */
  getTotals: (filters: Pick<CommissionFilters, "employeeId" | "startDate" | "endDate" | "competencia">) =>
    api
      .get<CommissionTotalsOut>("/commissions/summary", {
        params: {
          employee_id: filters.employeeId || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
          competencia: filters.competencia || undefined,
        },
      })
      .then((r) => r.data),

  /**
   * Meses de competência que realmente têm comissão (mais recente
   * primeiro) — usado pra popular o filtro de mês de forma dinâmica,
   * em vez de um intervalo fixo de anos. Cada item vem como "yyyy-mm-dd"
   * (dia 1).
   */
  getAvailableCompetencias: (employeeId?: string) =>
    api
      .get<string[]>("/commissions/competencias", {
        params: { employee_id: employeeId || undefined },
      })
      .then((r) => r.data),

  updateValue: (commissionId: string, payload: CommissionUpdateValueInput) =>
    api
      .patch<CommissionOut>(`/commissions/update-value/${commissionId}`, {
        commission_value: payload.commission_value,
      })
      .then((r) => r.data),

  /** Corrige o mês de competência de uma comissão — permitido em qualquer status. */
  updateCompetencia: (commissionId: string, payload: CommissionUpdateCompetenciaInput) =>
    api
      .patch<CommissionOut>(`/commissions/update-competencia/${commissionId}`, {
        competencia: payload.competencia,
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