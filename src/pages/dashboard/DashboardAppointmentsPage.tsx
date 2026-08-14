import { useState } from "react";
import { CalendarClock, Pencil, Search, Trash2, XCircle } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { MobileRowCard } from "@/components/tables/MobileRowCard";
import { Pagination } from "@/components/tables/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAdminSchedulings, useAdminSchedulingMutations, type AdminSchedulingFilters } from "@/hooks/useScheduling";
import { useTeam } from "@/hooks/useTeam";
import { usePublicServices } from "@/hooks/useServices";
import { CancelAppointmentModal } from "@/features/appointments/CancelAppointmentModal";
import { EditAppointmentModal } from "@/features/appointments/EditAppointmentModal";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate, formatTime, initials } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import {
  SCHEDULING_STATUS_LABELS,
  SCHEDULING_STATUS_BADGE,
  canAdminModifySchedule,
  getSchedulingEndTime,
  type SchedulingFilter,
  type SchedulingOut,
  type SchedulingStatus,
  type SchedulingUpdateInput,
} from "@/types/scheduling.types";
import type { ApiError } from "@/types/common";

const STATUS_OPTIONS: SchedulingStatus[] = [
  "created",
  "confirmed",
  "completed",
  "canceled",
  "no_show",
  "rescheduled",
];

function clientName(scheduling: SchedulingOut): string {
  return [scheduling.client.first_name, scheduling.client.last_name].filter(Boolean).join(" ") || "Cliente";
}

function employeeName(scheduling: SchedulingOut): string {
  return (
    [scheduling.employee.first_name, scheduling.employee.last_name].filter(Boolean).join(" ") || "Funcionário"
  );
}

export function DashboardAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [statusFilter, setStatusFilter] = useState<SchedulingFilter | "">("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  const filters: AdminSchedulingFilters = {
    status: statusFilter || undefined,
    employeeId: employeeFilter || undefined,
    serviceId: serviceFilter || undefined,
  };

  const { data, isLoading, isError, refetch } = useAdminSchedulings(filters, page, 10);
  const { update, cancel, remove } = useAdminSchedulingMutations();
  const { data: team } = useTeam(1, 100);
  const { data: services } = usePublicServices(1, 100);
  const { push } = useToast();

  // A API não tem busca por nome/e-mail do cliente em `list-all` —
  // filtra no front sobre a página já carregada, igual ao padrão usado
  // nas outras listagens que dependem de um lote batch.
  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const visibleItems = (data?.items ?? []).filter((s) => {
    if (!normalizedSearch) return true;
    const haystack = `${clientName(s)} ${s.client.user.email}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const [editing, setEditing] = useState<SchedulingOut | null>(null);
  const [cancelling, setCancelling] = useState<SchedulingOut | null>(null);
  const [deleting, setDeleting] = useState<SchedulingOut | null>(null);

  async function handleEdit(payload: SchedulingUpdateInput) {
    if (!editing) return;
    try {
      await update.mutateAsync({ id: editing.id, payload });
      push("Agendamento atualizado.", "success");
      setEditing(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
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

  async function handleDelete() {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      push("Agendamento excluído permanentemente.", "success");
      setDeleting(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  function renderActions(s: SchedulingOut) {
    const editable = canAdminModifySchedule(s);
    return (
      <>
        {editable && (
          <>
            <Button variant="ghost" size="icon" onClick={() => setEditing(s)} aria-label="Editar">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCancelling(s)} aria-label="Cancelar">
              <XCircle className="h-4 w-4 text-danger-500" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" onClick={() => setDeleting(s)} aria-label="Excluir permanentemente">
          <Trash2 className="h-4 w-4 text-danger-500" />
        </Button>
      </>
    );
  }

  const columns: Column<SchedulingOut>[] = [
    {
      header: "Cliente",
      cell: (s) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            src={s.client.photo_url}
            alt={clientName(s)}
            fallback={initials(s.client.first_name, s.client.last_name)}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-bone-50">{clientName(s)}</p>
            <p className="truncate text-xs text-bone-600">{s.client.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Serviço",
      cell: (s) => (
        <div className="min-w-0">
          <p className="truncate text-bone-200">{s.service.name}</p>
          <p className="truncate text-xs text-bone-600">com {employeeName(s)}</p>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      header: "Data",
      cell: (s) => (
        <div>
          <p className="text-bone-200">{formatDate(s.scheduled_time)}</p>
          <p className="text-xs text-bone-600">
            {formatTime(s.scheduled_time)} – {formatTime(getSchedulingEndTime(s))}
          </p>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      header: "Valor",
      cell: (s) => <span className="text-gold-400">{formatCurrencyBRL(s.price_at_booking)}</span>,
    },
    {
      header: "Status",
      cell: (s) => <Badge variant={SCHEDULING_STATUS_BADGE[s.status]}>{SCHEDULING_STATUS_LABELS[s.status]}</Badge>,
    },
    {
      header: "Ações",
      cell: (s) => <div className="flex justify-end gap-1">{renderActions(s)}</div>,
      className: "text-right",
    },
  ];

  function renderCard(s: SchedulingOut) {
    return (
      <MobileRowCard
        media={
          <Avatar
            src={s.client.photo_url}
            alt={clientName(s)}
            fallback={initials(s.client.first_name, s.client.last_name)}
            size="sm"
          />
        }
        title={clientName(s)}
        subtitle={s.client.user.email}
        badges={<Badge variant={SCHEDULING_STATUS_BADGE[s.status]}>{SCHEDULING_STATUS_LABELS[s.status]}</Badge>}
        meta={[
          { label: "Serviço", value: s.service.name },
          { label: "Profissional", value: employeeName(s) },
          { label: "Data", value: formatDate(s.scheduled_time) },
          { label: "Horário", value: `${formatTime(s.scheduled_time)} – ${formatTime(getSchedulingEndTime(s))}` },
          { label: "Valor", value: formatCurrencyBRL(s.price_at_booking) },
        ]}
        actions={
          <>
            {renderActions(s)}
            <ButtonLink to={ROUTES.dashboardAppointmentAdminDetail(s.id)} variant="ghost" size="icon" aria-label="Ver detalhes">
              <CalendarClock className="h-4 w-4" />
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl">Agendamentos</h1>
        <p className="mt-1 text-bone-500">Todos os agendamentos da plataforma, de todos os clientes.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Buscar por nome ou e-mail do cliente..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as SchedulingFilter | "");
            setPage(1);
          }}
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SCHEDULING_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={employeeFilter}
          onChange={(e) => {
            setEmployeeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos os profissionais</option>
          {team?.items.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {[employee.first_name, employee.last_name].filter(Boolean).join(" ") || employee.id}
            </option>
          ))}
        </Select>
        <Select
          value={serviceFilter}
          onChange={(e) => {
            setServiceFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos os serviços</option>
          {services?.items.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && visibleItems.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Nenhum agendamento encontrado"
            description="Ajuste os filtros de busca."
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={visibleItems}
              rowKey={(s) => s.id}
              isLoading={isLoading}
              renderCard={renderCard}
            />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <EditAppointmentModal
        open={!!editing}
        scheduling={editing}
        isSubmitting={update.isPending}
        onSubmit={handleEdit}
        onClose={() => setEditing(null)}
      />

      <CancelAppointmentModal
        open={!!cancelling}
        serviceName={cancelling?.service.name}
        isLoading={cancel.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelling(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Excluir agendamento"
        description={
          deleting
            ? `Tem certeza que deseja excluir permanentemente o agendamento de "${deleting.service.name}" para ${clientName(deleting)}? Essa ação apaga o histórico e não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        variant="danger"
        isLoading={remove.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}