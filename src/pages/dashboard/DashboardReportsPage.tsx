import { useMemo, useState } from "react";
import {
  FileBarChart2,
  Download,
  Wallet,
  CalendarCheck,
  TrendingUp,
  Users,
  PieChart as PieChartIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  RefreshCw,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { MobileRowCard } from "@/components/tables/MobileRowCard";
import { PieChart } from "@/components/charts/PieChart";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useMonthlyBalance, useReportHistory, useDownloadMonthlyBalancePdf } from "@/hooks/useReports";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL } from "@/utils/format";
import { SCHEDULING_STATUS_LABELS, type SchedulingStatus } from "@/types/scheduling.types";
import { MONTH_LABELS, type EmployeeBalanceOut } from "@/types/report";
import type { ApiError } from "@/types/common";

/** Ícone + cor por status, igual ao badge usado no resto do painel (`SCHEDULING_STATUS_BADGE`). */
const STATUS_ICON: Record<SchedulingStatus, LucideIcon> = {
  created: Clock,
  confirmed: Calendar,
  completed: CheckCircle2,
  canceled: XCircle,
  no_show: UserX,
  rescheduled: RefreshCw,
};

const STATUS_ICON_STYLES: Record<SchedulingStatus, string> = {
  created: "bg-gold-400/15 text-gold-400",
  confirmed: "bg-info-500/15 text-info-500",
  completed: "bg-success-500/15 text-success-500",
  canceled: "bg-danger-500/15 text-danger-500",
  no_show: "bg-purple-500/20 text-purple-400",
  rescheduled: "bg-orange-500/15 text-orange-500",
};

function initialsFromFullName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-gold-400">
        <Icon className="h-5 w-5" />
      </span>
      {isLoading ? (
        <Skeleton className="mt-4 h-8 w-24" />
      ) : (
        <p className="mt-4 font-display text-2xl text-bone-50">{value}</p>
      )}
      <p className="mt-1 text-xs uppercase tracking-wide text-bone-500">{label}</p>
    </Card>
  );
}

export function DashboardReportsPage() {
  const [period, setPeriod] = useState<{ year: number; month: number } | undefined>(undefined);

  const { data: history } = useReportHistory();
  const { data: balance, isLoading, isError, refetch } = useMonthlyBalance(period);
  const downloadPdf = useDownloadMonthlyBalancePdf();
  const { push } = useToast();

  // Garante que o mês corrente sempre apareça no filtro, mesmo antes de
  // ter sido aberto pela primeira vez (o histórico só lista meses que já
  // têm snapshot gerado — abrir a aba já gera o do mês atual).
  const periodOptions = useMemo(() => {
    const now = new Date();
    const current = { year: now.getFullYear(), month: now.getMonth() + 1 };
    const fromHistory = history ?? [];
    const hasCurrent = fromHistory.some((p) => p.year === current.year && p.month === current.month);
    const all = hasCurrent ? fromHistory : [current, ...fromHistory];
    return all.sort((a, b) => (a.year === b.year ? b.month - a.month : b.year - a.year));
  }, [history]);

  async function handleDownloadPdf() {
    try {
      await downloadPdf.mutateAsync(period ?? {});
      push("PDF do balanço gerado.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const employeeColumns: Column<EmployeeBalanceOut>[] = [
    {
      header: "Funcionário",
      cell: (e) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={e.employee_photo_url}
            alt={e.employee_name}
            fallback={initialsFromFullName(e.employee_name)}
            size="sm"
          />
          <span className="font-medium text-bone-50">{e.employee_name}</span>
        </div>
      ),
    },
    { header: "Atendimentos", cell: (e) => e.completed_appointments },
    { header: "Faturamento", cell: (e) => <span className="text-gold-400">{formatCurrencyBRL(e.revenue)}</span> },
    { header: "Comissão total", cell: (e) => formatCurrencyBRL(e.commission_total), hideOnMobile: true },
    { header: "Paga", cell: (e) => <span className="text-success-500">{formatCurrencyBRL(e.commission_paid)}</span> },
    { header: "Pendente", cell: (e) => <span className="text-gold-400">{formatCurrencyBRL(e.commission_pending)}</span> },
  ];

  function renderEmployeeCard(e: EmployeeBalanceOut) {
    return (
      <MobileRowCard
        media={
          <Avatar
            src={e.employee_photo_url}
            alt={e.employee_name}
            fallback={initialsFromFullName(e.employee_name)}
            size="sm"
          />
        }
        title={e.employee_name}
        meta={[
          { label: "Atendimentos", value: e.completed_appointments },
          { label: "Faturamento", value: formatCurrencyBRL(e.revenue) },
          { label: "Comissão total", value: formatCurrencyBRL(e.commission_total) },
          { label: "Paga", value: formatCurrencyBRL(e.commission_paid) },
          { label: "Pendente", value: formatCurrencyBRL(e.commission_pending) },
        ]}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">Relatórios</h1>
          <p className="mt-1 text-bone-500">Balanço mensal completo: agendamentos, faturamento e comissões.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={period ? `${period.year}-${period.month}` : "current"}
            onChange={(e) => {
              if (e.target.value === "current") {
                setPeriod(undefined);
                return;
              }
              const [year, month] = e.target.value.split("-").map(Number);
              setPeriod({ year, month });
            }}
            className="min-w-[180px]"
          >
            <option value="current">Mês corrente</option>
            {periodOptions.map((p) => (
              <option key={`${p.year}-${p.month}`} value={`${p.year}-${p.month}`}>
                {MONTH_LABELS[p.month]}/{p.year}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            isLoading={downloadPdf.isPending}
            disabled={!balance}
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="mt-8">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={CalendarCheck}
              label="Agendamentos no mês"
              value={String(balance?.total_appointments ?? 0)}
              isLoading={isLoading}
            />
            <StatCard
              icon={TrendingUp}
              label="Valor total arrecadado"
              value={formatCurrencyBRL(balance?.total_revenue ?? "0")}
              isLoading={isLoading}
            />
            <StatCard
              icon={Wallet}
              label="Comissões (paga / pendente)"
              value={`${formatCurrencyBRL(balance?.total_commissions_paid ?? "0")} / ${formatCurrencyBRL(balance?.total_commissions_pending ?? "0")}`}
              isLoading={isLoading}
            />
            <StatCard
              icon={FileBarChart2}
              label="Lucro líquido"
              value={formatCurrencyBRL(balance?.net_profit ?? "0")}
              isLoading={isLoading}
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-lg text-bone-50">Agendamentos por status</h2>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Object.entries(balance?.appointments_by_status ?? {}).map(([status, count]) => {
                    const Icon = STATUS_ICON[status as SchedulingStatus] ?? CalendarCheck;
                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between gap-3 rounded-card border border-ink-700 p-3"
                      >
                        <div>
                          <p className="text-2xl text-bone-50">{count}</p>
                          <p className="mt-0.5 text-xs text-bone-500">
                            {SCHEDULING_STATUS_LABELS[status as SchedulingStatus] ?? status}
                          </p>
                        </div>
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${STATUS_ICON_STYLES[status as SchedulingStatus] ?? "bg-ink-700 text-bone-300"}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-lg text-bone-50">Atendimentos por serviço</h2>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center">
                  <Skeleton className="h-[200px] w-[200px] rounded-full" />
                </div>
              ) : (balance?.service_breakdown.length ?? 0) === 0 ? (
                <EmptyState
                  icon={PieChartIcon}
                  title="Nenhum atendimento concluído no período"
                  description="O gráfico aparece assim que houver atendimentos concluídos no mês."
                />
              ) : (
                <PieChart
                  data={
                    balance?.service_breakdown.map((s) => ({
                      label: s.service_name,
                      value: s.completed_appointments,
                      percentage: Number(s.percentage),
                    })) ?? []
                  }
                  centerLabel="Concluídos"
                  centerValue={balance?.total_appointments ?? 0}
                />
              )}
            </CardBody>
          </Card>

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-gold-400" />
              <h2 className="text-lg text-bone-50">Balanço por funcionário</h2>
            </div>
            {!isLoading && (balance?.employee_breakdown.length ?? 0) === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum atendimento no período"
                description="Ainda não há atendimentos concluídos ou comissões neste mês."
              />
            ) : (
              <DataTable
                columns={employeeColumns}
                rows={balance?.employee_breakdown ?? []}
                rowKey={(e) => e.employee_id}
                isLoading={isLoading}
                renderCard={renderEmployeeCard}
              />
            )}
          </div>

          {balance?.generated_by_name && (
            <p className="mt-4 text-xs text-bone-600">
              Último balanço gerado por {balance.generated_by_name}.
            </p>
          )}
        </>
      )}
    </div>
  );
}