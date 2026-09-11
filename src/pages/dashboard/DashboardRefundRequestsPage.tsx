import { useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { MobileRowCard } from "@/components/tables/MobileRowCard";
import { Pagination } from "@/components/tables/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ReviewRefundRequestModal } from "@/features/payment/ReviewRefundRequestModal";
import { useAdminRefundRequests, useAdminRefundRequestMutations } from "@/hooks/useRefundRequests";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate } from "@/utils/format";
import {
  REFUND_REQUEST_STATUS_LABELS,
  REFUND_REQUEST_STATUS_BADGE,
  type RefundRequestOut,
  type RefundRequestStatus,
} from "@/types/refund-request";
import type { ApiError } from "@/types/common";

const STATUS_OPTIONS: RefundRequestStatus[] = ["pending", "approved", "rejected"];

export function DashboardRefundRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RefundRequestStatus | "">("pending");

  const { data, isLoading, isError, refetch } = useAdminRefundRequests(
    { status: statusFilter || undefined },
    page,
    10,
  );
  const { approve, reject } = useAdminRefundRequestMutations();
  const { push } = useToast();

  const [reviewing, setReviewing] = useState<RefundRequestOut | null>(null);

  async function handleApprove(adminNotes: string) {
    if (!reviewing) return;
    try {
      await approve.mutateAsync({ refundRequestId: reviewing.id, payload: { admin_notes: adminNotes } });
      push("Reembolso aprovado e estornado na Asaas.", "success");
      setReviewing(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleReject(adminNotes: string) {
    if (!reviewing) return;
    try {
      await reject.mutateAsync({ refundRequestId: reviewing.id, payload: { admin_notes: adminNotes } });
      push("Pedido de reembolso rejeitado.", "success");
      setReviewing(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const columns: Column<RefundRequestOut>[] = [
    {
      header: "Cliente",
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-bone-50">{r.client_name}</p>
          {r.service_name && <p className="truncate text-xs text-bone-600">{r.service_name}</p>}
        </div>
      ),
    },
    {
      header: "Original",
      cell: (r) => formatCurrencyBRL(r.original_value),
      hideOnMobile: true,
    },
    {
      header: "Taxa",
      cell: (r) => (
        <span className="text-danger-500">
          -{formatCurrencyBRL(r.fee_value)} ({Number(r.fee_percentage)}%)
        </span>
      ),
      hideOnMobile: true,
    },
    {
      header: "A devolver",
      cell: (r) => <span className="text-gold-400">{formatCurrencyBRL(r.refund_value)}</span>,
    },
    {
      header: "Status",
      cell: (r) => <Badge variant={REFUND_REQUEST_STATUS_BADGE[r.status]}>{REFUND_REQUEST_STATUS_LABELS[r.status]}</Badge>,
    },
    { header: "Criado em", cell: (r) => formatDate(r.created_at), hideOnMobile: true },
    {
      header: "Ações",
      cell: (r) =>
        r.status === "pending" ? (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setReviewing(r)}>
              Analisar
            </Button>
          </div>
        ) : (
          <span className="text-xs text-bone-600">{r.reviewed_by_name ?? "—"}</span>
        ),
      className: "text-right",
    },
  ];

  function renderRefundRequestCard(r: RefundRequestOut) {
    return (
      <MobileRowCard
        title={r.client_name}
        subtitle={r.service_name ?? undefined}
        badges={<Badge variant={REFUND_REQUEST_STATUS_BADGE[r.status]}>{REFUND_REQUEST_STATUS_LABELS[r.status]}</Badge>}
        meta={[
          { label: "Original", value: formatCurrencyBRL(r.original_value) },
          { label: "Taxa", value: `-${formatCurrencyBRL(r.fee_value)} (${Number(r.fee_percentage)}%)` },
          { label: "A devolver", value: formatCurrencyBRL(r.refund_value) },
          { label: "Criado em", value: formatDate(r.created_at) },
        ]}
        actions={
          r.status === "pending" ? (
            <Button variant="outline" size="sm" onClick={() => setReviewing(r)}>
              Analisar
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl">Reembolsos</h1>
        <p className="mt-1 text-bone-500">Pedidos de reembolso de agendamentos cancelados com pagamento já recebido.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as RefundRequestStatus | "");
            setPage(1);
          }}
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {REFUND_REQUEST_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState
            icon={CircleDollarSign}
            title="Nenhum pedido de reembolso"
            description={statusFilter === "pending" ? "Não há pedidos aguardando análise." : "Ajuste os filtros de busca."}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(r) => r.id}
              isLoading={isLoading}
              renderCard={renderRefundRequestCard}
            />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <ReviewRefundRequestModal
        open={!!reviewing}
        refundRequest={reviewing}
        isApproving={approve.isPending}
        isRejecting={reject.isPending}
        onClose={() => setReviewing(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}