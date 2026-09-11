import { useState } from "react";
import { Wallet } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { MobileRowCard } from "@/components/tables/MobileRowCard";
import { Pagination } from "@/components/tables/Pagination";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useAvailableCompetencias, useMyCommissions } from "@/hooks/useCommissions";
import { dateToMonthInput, formatCurrencyBRL, formatDate, formatMonthYear } from "@/utils/format";
import {
  COMMISSION_STATUS_BADGE,
  COMMISSION_STATUS_LABELS,
  type CommissionOut,
  type CommissionStatus,
} from "@/types/commission";

/** yyyy-mm (de <input type="month">) -> primeiro e último dia do mês, pro filtro start_date/end_date do backend. */
function monthInputToRange(value: string): { startDate: string; endDate: string } {
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();
  return { startDate: `${value}-01`, endDate: `${value}-${String(lastDay).padStart(2, "0")}` };
}

export function DashboardMyCommissionsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | "">("");
  const [competenciaFilter, setCompetenciaFilter] = useState(""); // "" ou "yyyy-MM"

  const { startDate, endDate } = competenciaFilter
    ? monthInputToRange(competenciaFilter)
    : { startDate: undefined, endDate: undefined };

  const {
    data: commissions,
    isLoading: isLoadingCommissions,
    isError: isCommissionsError,
    refetch: refetchCommissions,
  } = useMyCommissions({ status: statusFilter || undefined, startDate, endDate }, page, 10);

  // Meses que realmente têm comissão — popula o MonthPicker dinamicamente.
  const { data: availableCompetenciasRaw } = useAvailableCompetencias();
  const availableCompetencias = (availableCompetenciasRaw ?? []).map(dateToMonthInput);

  const rows = commissions?.items ?? [];

  const columns: Column<CommissionOut>[] = [
    {
      header: "Atendimento",
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-bone-50">{c.service_name}</p>
          <p className="truncate text-xs text-bone-600">{c.client_name}</p>
        </div>
      ),
    },
    { header: "Data", cell: (c) => formatDate(c.scheduled_time), hideOnMobile: true },
    {
      header: "Competência",
      cell: (c) => <span className="capitalize">{formatMonthYear(c.competencia)}</span>,
      hideOnMobile: true,
    },
    { header: "% Comissão", cell: (c) => `${Number(c.commission_percentage)}%`, hideOnMobile: true },
    {
      header: "Valor",
      cell: (c) => <span className="text-gold-400">{formatCurrencyBRL(c.commission_value)}</span>,
    },
    {
      header: "Status",
      cell: (c) => <Badge variant={COMMISSION_STATUS_BADGE[c.status]}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>,
    },
  ];

  function renderCommissionCard(c: CommissionOut) {
    return (
      <MobileRowCard
        key={c.id}
        title={c.service_name}
        subtitle={c.client_name}
        badges={<Badge variant={COMMISSION_STATUS_BADGE[c.status]}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>}
        meta={[
          { label: "Data", value: formatDate(c.scheduled_time) },
          { label: "Competência", value: formatMonthYear(c.competencia) },
          { label: "% Comissão", value: `${Number(c.commission_percentage)}%` },
          { label: "Valor", value: formatCurrencyBRL(c.commission_value) },
        ]}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-gold-400" />
        <h1 className="text-3xl">Minhas Comissões</h1>
      </div>
      <p className="mt-1 text-bone-500">
        Gerada automaticamente assim que um atendimento seu é marcado como concluído.
      </p>

      <Card className="mt-6">
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <MonthPicker
            label="Mês"
            value={competenciaFilter}
            onChange={(value) => {
              setCompetenciaFilter(value);
              setPage(1);
            }}
            allowEmpty
            hint="Mês em que o atendimento foi concluído"
            availableMonths={availableCompetencias}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as CommissionStatus | "");
              setPage(1);
            }}
          >
            <option value="">Todos os status</option>
            {(Object.keys(COMMISSION_STATUS_LABELS) as CommissionStatus[]).map((status) => (
              <option key={status} value={status}>
                {COMMISSION_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      <div className="mt-6">
        {isCommissionsError ? (
          <ErrorState onRetry={() => refetchCommissions()} />
        ) : !isLoadingCommissions && rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Nenhuma comissão encontrada"
            description="As comissões aparecem automaticamente assim que um atendimento seu é concluído. Tente ajustar os filtros."
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(c) => c.id}
              isLoading={isLoadingCommissions}
              renderCard={renderCommissionCard}
            />
            {commissions && commissions.pages > 1 && (
              <div className="mt-4">
                <Pagination page={commissions.page} pages={commissions.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}