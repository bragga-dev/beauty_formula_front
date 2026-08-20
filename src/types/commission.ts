/**
 * Comissões — espelham `employee_commission_schema.py` do backend.
 * Router montado em `/commissions/` (ver `payment/api/employee_commission.py`).
 */

/** Espelha `EmployeeCommission.CommissionStatus`. */
export type CommissionStatus = "pending" | "paid" | "canceled";

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: "Pendente",
  paid: "Paga",
  canceled: "Cancelada",
};

export const COMMISSION_STATUS_BADGE: Record<
  CommissionStatus,
  "neutral" | "success" | "danger" | "gold" | "crimson" | "info" | "purple" | "orange"
> = {
  pending: "gold",
  paid: "success",
  canceled: "danger",
};

/**
 * Representação flat de uma comissão — espelha `CommissionOut`. Em vez de
 * aninhar o Scheduling inteiro, expõe só os campos relevantes pra
 * conferência do repasse.
 */
export interface CommissionOut {
  id: string;
  employee_id: string;
  employee_name: string;
  scheduling_id: string;
  service_name: string;
  client_name: string;
  scheduled_time: string;
  price_at_booking: string;
  commission_percentage: string;
  commission_value: string;
  status: CommissionStatus;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

/** Gera a comissão de UM atendimento já concluído (valor calculado automaticamente). */
export interface CommissionCreateInput {
  scheduling_id: string;
}

/** Ajuste manual pontual do valor de uma comissão ainda pending. */
export interface CommissionUpdateValueInput {
  commission_value: number;
}

/** Filtros combináveis para listagem — todos opcionais. */
export interface CommissionFilters {
  employeeId?: string;
  status?: CommissionStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Atualiza de uma vez o status de todas as comissões pending de um
 * período (opcionalmente restrito a um funcionário). Só aceita "paid" ou
 * "canceled" como destino.
 */
export interface CommissionBulkStatusInput {
  employeeId?: string;
  startDate: string;
  endDate: string;
  status: Exclude<CommissionStatus, "pending">;
}

export interface CommissionBulkStatusOut {
  updated_count: number;
  commission_ids: string[];
}

/** Marca como paga uma seleção manual e específica de comissões (checkbox na tabela). */
export interface CommissionBulkMarkPaidInput {
  commissionIds: string[];
}

export interface CommissionBulkMarkPaidOut {
  updated_count: number;
  commission_ids: string[];
  skipped_ids: string[];
}

/**
 * Soma das comissões por status — mesmos filtros de funcionário/período
 * da listagem. `total_pending` é o valor total ainda a pagar ao
 * funcionário.
 */
export interface CommissionTotalsOut {
  total_pending: string;
  total_paid: string;
  total_canceled: string;
  pending_count: number;
  paid_count: number;
  canceled_count: number;
}