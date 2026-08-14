import { useState } from "react";
import { CreditCard, RefreshCw, RotateCcw, Search } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { MobileRowCard } from "@/components/tables/MobileRowCard";
import { Pagination } from "@/components/tables/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RefundPaymentModal } from "@/features/payment/RefundPaymentModal"
import { useAdminPayments, useAdminPaymentMutations } from "@/hooks/usePayment";
import { useToast } from "@/app/providers/toast-context";
import { formatCurrencyBRL, formatDate } from "@/utils/format";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_BADGE,
  PAYMENT_BILLING_TYPE_LABELS,
  isPaymentSettled,
  type PaymentOut,
  type PaymentStatus,
  type PaymentRefundInput,
} from "@/types/payment";
import type { ApiError } from "@/types/common";

const STATUS_OPTIONS: PaymentStatus[] = [
  "PENDING",
  "RECEIVED",
  "CONFIRMED",
  "OVERDUE",
  "REFUNDED",
  "CANCELLED",
];

export function DashboardPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");
  const [billingFilter, setBillingFilter] = useState<"" | "PIX" | "CREDIT_CARD">("");

  const { data, isLoading, isError, refetch } = useAdminPayments(
    { search: debouncedSearch, status: statusFilter, billing_type: billingFilter },
    page,
    10,
  );
  const { sync, refund } = useAdminPaymentMutations();
  const { push } = useToast();

  const [refunding, setRefunding] = useState<PaymentOut | null>(null);

  async function handleSync(payment: PaymentOut) {
    try {
      await sync.mutateAsync(payment.id);
      push("Pagamento sincronizado com a Asaas.", "success");
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  async function handleRefund(payload: PaymentRefundInput) {
    if (!refunding) return;
    try {
      await refund.mutateAsync({ paymentId: refunding.id, payload });
      push("Pagamento estornado.", "success");
      setRefunding(null);
    } catch (err) {
      push((err as ApiError).detail as string, "error");
    }
  }

  const columns: Column<PaymentOut>[] = [
    {
      header: "Cliente",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-bone-50">{p.client_name}</p>
          <p className="truncate text-xs text-bone-600">{p.client_email}</p>
        </div>
      ),
    },
    {
      header: "Serviço",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate text-bone-200">{p.service_name ?? "—"}</p>
          {p.scheduled_time && <p className="text-xs text-bone-600">{formatDate(p.scheduled_time)}</p>}
        </div>
      ),
      hideOnMobile: true,
    },
    {
      header: "Valor",
      cell: (p) => <span className="text-gold-400">{formatCurrencyBRL(p.value)}</span>,
    },
    {
      header: "Forma",
      cell: (p) =>
        PAYMENT_BILLING_TYPE_LABELS[p.billing_type as "PIX" | "CREDIT_CARD"] ?? p.billing_type,
      hideOnMobile: true,
    },
    {
      header: "Status",
      cell: (p) => <Badge variant={PAYMENT_STATUS_BADGE[p.status]}>{PAYMENT_STATUS_LABELS[p.status]}</Badge>,
    },
    { header: "Criado em", cell: (p) => formatDate(p.created_at), hideOnMobile: true },
    {
      header: "Ações",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleSync(p)} aria-label="Sincronizar com a Asaas">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {isPaymentSettled(p) && (
            <Button variant="ghost" size="icon" onClick={() => setRefunding(p)} aria-label="Estornar">
              <RotateCcw className="h-4 w-4 text-danger-500" />
            </Button>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  function renderPaymentCard(p: PaymentOut) {
    return (
      <MobileRowCard
        title={p.client_name}
        subtitle={p.client_email}
        badges={<Badge variant={PAYMENT_STATUS_BADGE[p.status]}>{PAYMENT_STATUS_LABELS[p.status]}</Badge>}
        meta={[
          { label: "Serviço", value: p.service_name ?? "—" },
          { label: "Valor", value: formatCurrencyBRL(p.value) },
          { label: "Forma", value: PAYMENT_BILLING_TYPE_LABELS[p.billing_type as "PIX" | "CREDIT_CARD"] ?? p.billing_type },
          { label: "Criado em", value: formatDate(p.created_at) },
        ]}
        actions={
          <>
            <Button variant="ghost" size="icon" onClick={() => handleSync(p)} aria-label="Sincronizar com a Asaas">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {isPaymentSettled(p) && (
              <Button variant="ghost" size="icon" onClick={() => setRefunding(p)} aria-label="Estornar">
                <RotateCcw className="h-4 w-4 text-danger-500" />
              </Button>
            )}
          </>
        }
      />
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl">Pagamentos</h1>
        <p className="mt-1 text-bone-500">Todas as cobranças da plataforma, por cliente.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
            setStatusFilter(e.target.value as PaymentStatus | "");
            setPage(1);
          }}
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={billingFilter}
          onChange={(e) => {
            setBillingFilter(e.target.value as "" | "PIX" | "CREDIT_CARD");
            setPage(1);
          }}
        >
          <option value="">Todas as formas</option>
          <option value="PIX">Pix</option>
          <option value="CREDIT_CARD">Cartão de Crédito</option>
        </Select>
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !isLoading && data?.items.length === 0 ? (
          <EmptyState icon={CreditCard} title="Nenhum pagamento encontrado" description="Ajuste os filtros de busca." />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(p) => p.id}
              isLoading={isLoading}
              renderCard={renderPaymentCard}
            />
            {data && (
              <div className="mt-4">
                <Pagination page={data.page} pages={data.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <RefundPaymentModal
        open={!!refunding}
        paymentValue={refunding ? formatCurrencyBRL(refunding.value) : undefined}
        isLoading={refund.isPending}
        onClose={() => setRefunding(null)}
        onConfirm={handleRefund}
      />
    </div>
  );
}