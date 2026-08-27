/**
 * Comissões — espelham `employee_commission_schema.py` do backend.
 * Router montado em `/commissions/` (ver `payment/api/employee_commission.py`).
 *
 * Geração é 100% automática: o backend cria a comissão (status pending)
 * assim que o atendimento correspondente é marcado como concluído
 * (`generate_commission_for_completed_scheduling`, disparado dentro da
 * mesma transação de `complete_scheduling_for_employee`). Não existe
 * criação manual no front — o admin só lista, filtra, corrige valor/
 * competência pontualmente, marca como paga/reverte/cancela.
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
  /**
   * Mês de referência EFETIVO da comissão (yyyy-mm-01) — o dado que entra
   * aqui é sempre um mês (dia normalizado pro dia 1). Calculado
   * automaticamente pelo backend a partir do mês em que o atendimento foi
   * concluído (`scheduling.completed_at`). Só é alterado se o admin fizer
   * uma correção pontual (ver `competencia_was_adjusted` abaixo).
   */
  competencia: string;
  /** Snapshot imutável do mês calculado automaticamente na criação — nunca muda. */
  competencia_original: string;
  /** true quando `competencia` foi corrigida manualmente e diverge de `competencia_original`. */
  competencia_was_adjusted: boolean;
  competencia_changed_by_name?: string | null;
  competencia_changed_at?: string | null;
  created_at: string;
  updated_at: string;
}

/** Ajuste manual pontual do valor de uma comissão ainda pending. */
export interface CommissionUpdateValueInput {
  commission_value: number;
}

/**
 * Correção manual do mês de competência de UMA comissão — qualquer status.
 * Aceita qualquer dia do mês desejado; normalizado pro dia 1 no backend.
 */
export interface CommissionUpdateCompetenciaInput {
  competencia: string; // yyyy-mm-dd
}

/** Filtros combináveis para listagem — todos opcionais. */
export interface CommissionFilters {
  employeeId?: string;
  status?: CommissionStatus;
  startDate?: string;
  endDate?: string;
  /** Filtra pelo mês de competência (yyyy-mm-dd, qualquer dia do mês desejado). */
  competencia?: string;
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

/**
 * Resultado de uma geração/sincronização em lote: cria a comissão de
 * todo atendimento concluído (do período, ou de todo o histórico,
 * dependendo do endpoint) que ainda não tem comissão. Idempotente —
 * rodar de novo não duplica nada.
 */
export interface CommissionBulkGenerateOut {
  created: CommissionOut[];
  created_count: number;
  skipped_count: number;
  total_completed_schedulings: number;
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