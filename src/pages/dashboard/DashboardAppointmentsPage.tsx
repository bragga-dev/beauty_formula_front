import { useState } from "react";
import { CalendarClock, Eye, XCircle } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CancelAppointmentModal } from "@/features/appointments/CancelAppointmentModal";
import { useAdminSchedulings, useAdminSchedulingMutations, type AdminSchedulingFilters } from "@/hooks/useScheduling";
import { useTeam } from "@/hooks/useTeam";
import { usePublicServices } from "@/hooks/useServices";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate, formatTime } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import {
  SCHEDULING_STATUS_LABELS,
  SCHEDULING_STATUS_BADGE,
  canAdminModifySchedule,
  type SchedulingFilter,
  type SchedulingPrivateOut,
} from "@/types/scheduling.types";
import type { ApiError } from "@/types/common";

const FILTERS: { value: SchedulingFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "confirmed", label: SCHEDULING_STATUS_LABELS.confirmed },
  { value: "completed", label: SCHEDULING_STATUS_LABELS.completed },
  { value: "canceled", label: SCHEDULING_STATUS_LABELS.canceled },
  { value: "no_show", label: SCHEDULING_STATUS_LABELS.no_show },
  { value: "rescheduled", label: SCHEDULING_STATUS_LABELS.rescheduled },
];

function clientName(scheduling: SchedulingPrivateOut): string {
  return [scheduling.client.first_name, scheduling.client.last_name].filter(Boolean).join(" ") || "Cliente";
}

function employeeName(scheduling: SchedulingPrivateOut): string {
  return [scheduling.employee.first_name, scheduling.employee.last_name].filter(Boolean).join(" ") || "Funcionário";
}

export function DashboardAppointmentsPage() {
  const [filters, setFilters] = useState<AdminSchedulingFilters>({ status: "all" });
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useAdminSchedulings(filters, page);
  const { cancel } = useAdminSchedulingMutations();
  const { data: team } = useTeam(1, 100);
  const { data: services } = usePublicServices(1, 100);
  const { push } = useToast();

  const [cancelling, setCancelling] = useState<SchedulingPrivateOut | null>(null);

  function updateFilters(patch: Partial<AdminSchedulingFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  async function handleCancel(reason: string) {
    if (!cancelling) return;
    try {
      await cancel.mutateAsync({ id: cancelling.id, payload: { reason } });
      push("Agendamento cancelado.", "success");
      setCancelling(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const columns: Column<SchedulingPrivateOut>[] = [
    { header: "Cliente", cell: (s) => <span className="font-medium text-bone-50">{clientName(s)}</span> },
    { header: "Funcionário", cell: (s) => employeeName(s), hideOnMobile: true },
    { header: "Serviço", cell: (s) => s.service.name, hideOnMobile: true },
    {
      header: "Data",
      cell: (s) => (
        <div className="flex flex-col">
          <span>{formatDate(s.scheduled_time)}</span>
          <span className="text-xs text-bone-500">{formatTime(s.scheduled_time)}</span>
        </div>
      ),
    },
    { header: "Valor", cell: (s) => formatCurrencyBRL(s.price_at_booking), hideOnMobile: true },
    {
      header: "Status",
      cell: (s) => <Badge variant={SCHEDULING_STATUS_BADGE[s.status]}>{SCHEDULING_STATUS_LABELS[s.status]}</Badge>,
    },
    {
      header: "Ações",
      cell: (s) => (
        <div className="flex justify-end gap-1">
          {canAdminModifySchedule(s) && (
            <Button variant="ghost" size="icon" onClick={() => setCancelling(s)} aria-label="Cancelar">
              <XCircle className="h-4 w-4 text-danger-500" />
            </Button>
          )}
          <ButtonLink
            to={ROUTES.dashboardAppointmentAdminDetail(s.id)}
            variant="ghost"
            size="icon"
            aria-label="Ver detalhes"
          >
            <Eye className="h-4 w-4" />
          </ButtonLink>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div>
      <div>
        <h1 className="text-3xl">Agendamentos</h1>
        <p className="mt-1 text-bone-500">Visão geral de todos os agendamentos da Fórmula da Beleza.</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => updateFilters({ status: f.value })}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
              filters.status === f.value
                ? "border-crimson-500 bg-crimson-500 text-bone-50"
                : "border-ink-700 text-bone-400 hover:border-gold-400 hover:text-gold-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          aria-label="Funcionário"
          value={filters.employeeId ?? ""}
          onChange={(e) => updateFilters({ employeeId: e.target.value || undefined })}
        >
          <option value="">Todos os funcionários</option>
          {team?.items.map((e) => (
            <option key={e.id} value={e.id}>
              {[e.first_name, e.last_name].filter(Boolean).join(" ") || "Sem nome"}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Serviço"
          value={filters.serviceId ?? ""}
          onChange={(e) => updateFilters({ serviceId: e.target.value || undefined })}
        >
          <option value="">Todos os serviços</option>
          {services?.items.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Input
          type="date"
          aria-label="Data inicial"
          value={filters.startDate ?? ""}
          onChange={(e) => updateFilters({ startDate: e.target.value || undefined })}
        />

        <Input
          type="date"
          aria-label="Data final"
          value={filters.endDate ?? ""}
          onChange={(e) => updateFilters({ endDate: e.target.value || undefined })}
        />
      </div>

      <div className="mt-6">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nenhum agendamento encontrado"
            description="Não há agendamentos para os filtros selecionados."
          />
        ) : (
          <>
            <DataTable columns={columns} rows={data?.items ?? []} rowKey={(s) => s.id} isLoading={isLoading} />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <CancelAppointmentModal
        open={!!cancelling}
        serviceName={cancelling?.service.name}
        isLoading={cancel.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelling(null)}
      />
    </div>
  );
}