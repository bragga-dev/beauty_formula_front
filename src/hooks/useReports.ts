import { useMutation, useQuery } from "@tanstack/react-query";
import { reportService, type MonthlyBalanceParams } from "@/services/report.service";

/**
 * Sem `year`/`month`, o backend assume o mês corrente. Cada combinação
 * de período vira sua própria query — trocar o filtro não perde o
 * cache do mês anterior (volta pra ele instantâneo).
 */
export function useMonthlyBalance(params: MonthlyBalanceParams = {}) {
  return useQuery({
    queryKey: ["reports", "monthly-balance", params.year ?? "current", params.month ?? "current"],
    queryFn: () => reportService.getMonthlyBalance(params),
  });
}

/** Meses que já têm balanço gerado — alimenta o <Select> de período. */
export function useReportHistory() {
  return useQuery({
    queryKey: ["reports", "history"],
    queryFn: () => reportService.listHistory(),
  });
}

/** Dispara o download do PDF do balanço do período informado. */
export function useDownloadMonthlyBalancePdf() {
  return useMutation({
    mutationFn: async (params: MonthlyBalanceParams) => {
      const blob = await reportService.downloadPdf(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const year = params.year ?? new Date().getFullYear();
      const month = params.month ?? new Date().getMonth() + 1;
      a.download = `balanco-${year}-${String(month).padStart(2, "0")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}