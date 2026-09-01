/**
 * Relatórios — espelha `monthly_report_schema.py` do backend.
 * Router montado em `/reports/` (ver `reports/api/monthly_report.py`).
 *
 * O balanço é sempre recalculado e persistido (snapshot) quando a rota
 * `/monthly-balance` é chamada — não existe um "gerar relatório"
 * separado de "ver relatório" no front: abrir a aba já gera/atualiza.
 */

/** Balanço de um funcionário dentro do mês — atendimentos concluídos, faturamento e comissões. */
export interface EmployeeBalanceOut {
  employee_id: string;
  employee_name: string;
  completed_appointments: number;
  revenue: string;
  commission_total: string;
  commission_paid: string;
  commission_pending: string;
}

/** Balanço geral de um mês (empresa toda) + o detalhamento por funcionário. */
export interface MonthlyBalanceOut {
  id: string;
  year: number;
  month: number;
  appointments_by_status: Record<string, number>;
  total_appointments: number;
  total_revenue: string;
  total_commissions: string;
  total_commissions_paid: string;
  total_commissions_pending: string;
  net_profit: string;
  employee_breakdown: EmployeeBalanceOut[];
  generated_at: string;
  generated_by_name?: string | null;
}

/** Mês que já tem balanço gerado — usado para popular o filtro de período. */
export interface AvailablePeriodOut {
  year: number;
  month: number;
}

export const MONTH_LABELS: Record<number, string> = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro",
};