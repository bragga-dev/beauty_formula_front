import { api } from "./api";
import type { AvailablePeriodOut, MonthlyBalanceOut } from "@/types/report";

export interface MonthlyBalanceParams {
  year?: number;
  month?: number;
}

export const reportService = {
  /** Sem parâmetros: mês corrente (recalcula e atualiza o snapshot). */
  getMonthlyBalance: (params: MonthlyBalanceParams = {}) =>
    api.get<MonthlyBalanceOut>("/reports/monthly-balance", { params }).then((r) => r.data),

  /** Meses que já têm balanço gerado — popula o filtro de período. */
  listHistory: () =>
    api.get<AvailablePeriodOut[]>("/reports/monthly-balance/history").then((r) => r.data),

  /** Devolve o PDF como blob, pronto pra virar um download no browser. */
  downloadPdf: (params: MonthlyBalanceParams = {}) =>
    api
      .get<Blob>("/reports/monthly-balance/pdf", { params, responseType: "blob" })
      .then((r) => r.data),
};