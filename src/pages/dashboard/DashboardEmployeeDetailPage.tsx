import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  AtSign,
  Ban,
  CalendarCog,
  CheckCheck,
  CheckCircle2,
  Pencil,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { MobileRowCard } from "@/components/tables/MobileRowCard";
import { Pagination } from "@/components/tables/Pagination";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTeamMember } from "@/hooks/useTeam";
import { useCommissions, useCommissionMutations, useCommissionTotals } from "@/hooks/useCommissions";
import { EditCommissionValueModal } from "@/features/team/EditCommissionValueModal";
import { EditCommissionCompetenciaModal } from "@/features/team/EditCommissionCompetenciaModal";
import { EmployeeMonthCalendar } from "@/features/team/EmployeeMonthCalendar";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate, formatMonthYear, initials, monthInputToDate } from "@/utils/format";
import { ROUTES } from "@/constants/routes";
import {
  COMMISSION_STATUS_BADGE,
  COMMISSION_STATUS_LABELS,
  type CommissionOut,
  type CommissionStatus,
} from "@/types/commission";
import type { ApiError } from "@/types/common";

export function DashboardEmployeeDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { push } = useToast();

  const { data: employee, isLoading: isLoadingEmployee, isError: isEmployeeError, refetch: refetchEmployee } =
    useTeamMember(employeeId);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [competenciaFilter, setCompetenciaFilter] = useState(""); // "" ou "yyyy-MM"
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const competencia = competenciaFilter ? monthInputToDate(competenciaFilter) : undefined;

  const {
    data: commissions,
    isLoading: isLoadingCommissions,
    isError: isCommissionsError,
    refetch: refetchCommissions,
  } = useCommissions({ employeeId, status: statusFilter || undefined, startDate, endDate, competencia }, page, 10);

  const { data: totals } = useCommissionTotals({ employeeId, startDate, endDate, competencia });

  const { updateValue, updateCompetencia, markAsPaid, markManyAsPaid, revertToPending, cancel } =
    useCommissionMutations();

  const [editingCommission, setEditingCommission] = useState<CommissionOut | null>(null);
  const [editingCompetencia, setEditingCompetencia] = useState<CommissionOut | null>(null);
  const [cancelingCommission, setCancelingCommission] = useState<CommissionOut | null>(null);
  const [revertingCommission, setRevertingCommission] = useState<CommissionOut | null>(null);
  const [confirmingBulkPay, setConfirmingBulkPay] = useState(false);

  const rows = commissions?.items ?? [];
  const selectablePendingIds = rows.filter((c) => c.status === "pending").map((c) => c.id);
  const allPendingSelected =
    selectablePendingIds.length > 0 && selectablePendingIds.every((id) => selectedIds.includes(id));

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAllPending() {
    setSelectedIds((prev) =>
      allPendingSelected
        ? prev.filter((id) => !selectablePendingIds.includes(id))
        : [...new Set([...prev, ...selectablePendingIds])],
    );
  }

  async function handleMarkAsPaid(commission: CommissionOut) {
    try {
      await markAsPaid.mutateAsync(commission.id);
      push("Comissão marcada como paga.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleMarkSelectedAsPaid() {
    try {
      const result = await markManyAsPaid.mutateAsync({ commissionIds: selectedIds });
      push(`${result.updated_count} comissão(ões) marcada(s) como paga(s).`, "success");
      setSelectedIds([]);
      setConfirmingBulkPay(false);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleEditValue(value: number) {
    if (!editingCommission) return;
    try {
      await updateValue.mutateAsync({ id: editingCommission.id, payload: { commission_value: value } });
      push("Valor da comissão atualizado.", "success");
      setEditingCommission(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleEditCompetencia(competenciaValue: string) {
    if (!editingCompetencia) return;
    try {
      await updateCompetencia.mutateAsync({ id: editingCompetencia.id, payload: { competencia: competenciaValue } });
      push("Competência da comissão atualizada.", "success");
      setEditingCompetencia(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleCancel() {
    if (!cancelingCommission) return;
    try {
      await cancel.mutateAsync(cancelingCommission.id);
      push("Comissão cancelada.", "success");
      setCancelingCommission(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleRevert() {
    if (!revertingCommission) return;
    try {
      await revertToPending.mutateAsync(revertingCommission.id);
      push("Comissão revertida para pendente.", "success");
      setRevertingCommission(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  if (isLoadingEmployee) {
    return (
      <div className="mx-auto max-w-4xl">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-6 h-40 w-full" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (isEmployeeError || !employee) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState message="Não foi possível carregar este funcionário." onRetry={() => refetchEmployee()} />
      </div>
    );
  }

  const employeeName = [employee.first_name, employee.last_name].filter(Boolean).join(" ") || "Sem nome";

  const columns: Column<CommissionOut>[] = [
    {
      header: "",
      cell: (c) =>
        c.status === "pending" ? (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-bone-500/40 bg-ink-800 accent-gold-400"
            checked={selectedIds.includes(c.id)}
            onChange={() => toggleSelected(c.id)}
            aria-label="Selecionar comissão"
          />
        ) : null,
      className: "w-10",
    },
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
      cell: (c) => (
        <button
          type="button"
          onClick={() => setEditingCompetencia(c)}
          className="flex items-center gap-1.5 capitalize text-bone-200 hover:text-gold-400"
          title={
            c.competencia_was_adjusted
              ? `Ajustada de ${formatMonthYear(c.competencia_original)}${
                  c.competencia_changed_by_name ? ` por ${c.competencia_changed_by_name}` : ""
                }`
              : "Corrigir competência"
          }
        >
          {formatMonthYear(c.competencia)}
          {c.competencia_was_adjusted && <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />}
          <Pencil className="h-3 w-3 opacity-50" />
        </button>
      ),
      hideOnMobile: true,
    },
    {
      header: "% Comissão",
      cell: (c) => `${Number(c.commission_percentage)}%`,
      hideOnMobile: true,
    },
    {
      header: "Valor",
      cell: (c) => <span className="text-gold-400">{formatCurrencyBRL(c.commission_value)}</span>,
    },
    {
      header: "Status",
      cell: (c) => <Badge variant={COMMISSION_STATUS_BADGE[c.status]}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>,
    },
    {
      header: "Ações",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          {c.status === "pending" && (
            <>
              <Button variant="ghost" size="icon" onClick={() => handleMarkAsPaid(c)} aria-label="Marcar como paga">
                <CheckCircle2 className="h-4 w-4 text-success-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setEditingCommission(c)} aria-label="Corrigir valor">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCancelingCommission(c)} aria-label="Cancelar">
                <Ban className="h-4 w-4 text-danger-500" />
              </Button>
            </>
          )}
          {c.status === "paid" && (
            <Button variant="ghost" size="icon" onClick={() => setRevertingCommission(c)} aria-label="Reverter pagamento">
              <RotateCcw className="h-4 w-4 text-bone-400" />
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  function renderCommissionCard(c: CommissionOut) {
    return (
      <MobileRowCard
        title={c.service_name}
        subtitle={c.client_name}
        badges={<Badge variant={COMMISSION_STATUS_BADGE[c.status]}>{COMMISSION_STATUS_LABELS[c.status]}</Badge>}
        meta={[
          { label: "Data", value: formatDate(c.scheduled_time) },
          {
            label: "Competência",
            value: formatMonthYear(c.competencia) + (c.competencia_was_adjusted ? " (ajustada)" : ""),
          },
          { label: "% Comissão", value: `${Number(c.commission_percentage)}%` },
          { label: "Valor", value: formatCurrencyBRL(c.commission_value) },
        ]}
        actions={
          <>
            <Button variant="ghost" size="icon" onClick={() => setEditingCompetencia(c)} aria-label="Corrigir competência">
              <CalendarCog className="h-4 w-4" />
            </Button>
            {c.status === "pending" && (
              <>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-bone-500/40 bg-ink-800 accent-gold-400"
                  checked={selectedIds.includes(c.id)}
                  onChange={() => toggleSelected(c.id)}
                  aria-label="Selecionar comissão"
                />
                <Button variant="ghost" size="icon" onClick={() => handleMarkAsPaid(c)} aria-label="Marcar como paga">
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setEditingCommission(c)} aria-label="Corrigir valor">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCancelingCommission(c)} aria-label="Cancelar">
                  <Ban className="h-4 w-4 text-danger-500" />
                </Button>
              </>
            )}
            {c.status === "paid" && (
              <Button variant="ghost" size="icon" onClick={() => setRevertingCommission(c)} aria-label="Reverter pagamento">
                <RotateCcw className="h-4 w-4 text-bone-400" />
              </Button>
            )}
          </>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate(ROUTES.dashboardTeam)}
        className="mb-6 flex items-center gap-1.5 text-sm text-bone-500 hover:text-bone-100"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para equipe
      </button>

      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              src={employee.photo_url}
              alt={employeeName}
              fallback={initials(employee.first_name, employee.last_name)}
              size="lg"
            />
            <div>
              <p className="font-display text-2xl uppercase tracking-wide text-bone-50">{employeeName}</p>
              {employee.instagram && (
                <p className="mt-1 flex items-center gap-1 text-sm text-gold-400">
                  <AtSign className="h-3.5 w-3.5" /> {employee.instagram}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" disabled title="Em breve">
              <Pencil className="h-4 w-4" /> Editar perfil
            </Button>
          </div>
        </CardHeader>

        {employee.bio && (
          <CardBody>
            <p className="text-sm text-bone-300">{employee.bio}</p>
          </CardBody>
        )}
      </Card>

      {employeeId && (
        <div className="mt-8">
          <EmployeeMonthCalendar employeeId={employeeId} />
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-gold-400" />
            <h2 className="text-xl">Comissões</h2>
          </div>
        </div>
        <p className="mt-1 text-xs text-bone-600">
          Gerada automaticamente, com status pendente, assim que o atendimento correspondente é marcado como
          concluído. Não existe geração manual.
        </p>

        {totals && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody className="py-4">
                <p className="text-xs uppercase tracking-wide text-bone-500">A pagar</p>
                <p className="mt-1 font-display text-2xl text-gold-400">{formatCurrencyBRL(totals.total_pending)}</p>
                <p className="mt-0.5 text-xs text-bone-600">{totals.pending_count} comissão(ões) pendente(s)</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="py-4">
                <p className="text-xs uppercase tracking-wide text-bone-500">Pago no período</p>
                <p className="mt-1 font-display text-2xl text-success-500">{formatCurrencyBRL(totals.total_paid)}</p>
                <p className="mt-0.5 text-xs text-bone-600">{totals.paid_count} comissão(ões) paga(s)</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="py-4">
                <p className="text-xs uppercase tracking-wide text-bone-500">Cancelado</p>
                <p className="mt-1 font-display text-2xl text-danger-500">{formatCurrencyBRL(totals.total_canceled)}</p>
                <p className="mt-0.5 text-xs text-bone-600">{totals.canceled_count} comissão(ões) cancelada(s)</p>
              </CardBody>
            </Card>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MonthPicker
            label="Mês"
            value={competenciaFilter}
            onChange={(value) => {
              setCompetenciaFilter(value);
              setPage(1);
            }}
            allowEmpty
            hint="Mês em que o atendimento foi concluído"
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
          <Input
            label="De (opcional)"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
          <Input
            label="Até (opcional)"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <p className="mt-2 text-xs text-bone-600">
          <strong className="text-bone-400">Mês</strong> filtra pela competência (mês de referência da comissão —
          normalmente o mês em que o atendimento foi concluído). <strong className="text-bone-400">De/Até</strong>{" "}
          é um filtro alternativo pela data exata do atendimento, útil pra períodos que não fecham num mês
          redondo (ex.: quinzena). Use um ou outro.
        </p>

        {selectablePendingIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-ink-700 bg-ink-800/50 px-4 py-3">
            <label className="flex items-center gap-2 text-sm text-bone-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-bone-500/40 bg-ink-800 accent-gold-400"
                checked={allPendingSelected}
                onChange={toggleSelectAllPending}
              />
              Selecionar todas pendentes da página
            </label>
            <span className="text-sm text-bone-600">
              {selectedIds.length > 0 ? `${selectedIds.length} selecionada(s)` : ""}
            </span>
            <Button
              size="sm"
              variant="gold"
              className="ml-auto"
              disabled={selectedIds.length === 0}
              onClick={() => setConfirmingBulkPay(true)}
            >
              <CheckCheck className="h-4 w-4" /> Marcar selecionadas como pagas
            </Button>
          </div>
        )}

        <div className="mt-6">
          {isCommissionsError ? (
            <ErrorState onRetry={() => refetchCommissions()} />
          ) : !isLoadingCommissions && commissions?.items.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="Nenhuma comissão encontrada"
              description="As comissões aparecem automaticamente assim que um atendimento é concluído. Tente ajustar os filtros de status ou período."
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
              {commissions && (
                <div className="mt-4">
                  <Pagination page={commissions.page} pages={commissions.pages} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <EditCommissionValueModal
        open={!!editingCommission}
        commission={editingCommission}
        isLoading={updateValue.isPending}
        onClose={() => setEditingCommission(null)}
        onSubmit={handleEditValue}
      />

      <EditCommissionCompetenciaModal
        open={!!editingCompetencia}
        commission={editingCompetencia}
        isLoading={updateCompetencia.isPending}
        onClose={() => setEditingCompetencia(null)}
        onSubmit={handleEditCompetencia}
      />

      <ConfirmDialog
        open={!!cancelingCommission}
        title="Cancelar comissão"
        description={`Cancelar a comissão de "${cancelingCommission?.service_name}" para ${cancelingCommission?.client_name}?`}
        confirmLabel="Cancelar comissão"
        variant="danger"
        isLoading={cancel.isPending}
        onConfirm={handleCancel}
        onCancel={() => setCancelingCommission(null)}
      />

      <ConfirmDialog
        open={!!revertingCommission}
        title="Reverter pagamento"
        description={`Reverter a comissão de "${revertingCommission?.service_name}" para ${revertingCommission?.client_name}" de volta para pendente?`}
        confirmLabel="Reverter"
        variant="primary"
        isLoading={revertToPending.isPending}
        onConfirm={handleRevert}
        onCancel={() => setRevertingCommission(null)}
      />

      <ConfirmDialog
        open={confirmingBulkPay}
        title="Marcar comissões como pagas"
        description={`Marcar as ${selectedIds.length} comissão(ões) selecionada(s) como pagas?`}
        confirmLabel="Marcar como pagas"
        variant="primary"
        isLoading={markManyAsPaid.isPending}
        onConfirm={handleMarkSelectedAsPaid}
        onCancel={() => setConfirmingBulkPay(false)}
      />
    </div>
  );
}