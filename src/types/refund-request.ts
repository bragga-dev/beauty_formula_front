/**
 * Pedidos de reembolso — espelham `refund_request_schema.py` do backend.
 * Router montado em `/payments/refund-requests/` (ver `payment/api/refund_request.py`).
 *
 * Criação é 100% automática: o backend cria o pedido (status pending)
 * sempre que um agendamento com pagamento já recebido é cancelado —
 * seja pelo cliente, funcionário, admin, ou pelo sistema (conflito de
 * horário). Não existe criação manual no front — o admin só analisa
 * (aprova/rejeita) os que já existem.
 *
 * A taxa de cancelamento (10% por padrão) só é aplicada quando é o
 * CLIENTE quem cancela por conta própria — cancelamento iniciado pelo
 * salão (funcionário/admin) ou por um conflito de sistema gera pedido
 * com taxa 0% (reembolso integral). Isso já vem calculado do backend em
 * `fee_percentage`/`fee_value`/`refund_value` — o front só exibe.
 */

/** Espelha `RefundRequest.RefundRequestStatus`. */
export type RefundRequestStatus = "pending" | "approved" | "rejected";

export const REFUND_REQUEST_STATUS_LABELS: Record<RefundRequestStatus, string> = {
  pending: "Aguardando análise",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

export const REFUND_REQUEST_STATUS_BADGE: Record<
  RefundRequestStatus,
  "neutral" | "success" | "danger" | "gold" | "crimson" | "info" | "purple" | "orange"
> = {
  pending: "gold",
  approved: "success",
  rejected: "danger",
};

export interface RefundRequestOut {
  id: string;
  payment_id: string;
  client_id: string;
  client_name: string;
  scheduling_id?: string | null;
  service_name?: string | null;
  requested_by_name: string;
  reason: string;
  original_value: string;
  fee_percentage: string;
  fee_value: string;
  refund_value: string;
  status: RefundRequestStatus;
  admin_notes: string;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

/** Aprovar ou rejeitar — os dois aceitam uma observação opcional do admin. */
export interface RefundRequestReviewInput {
  admin_notes?: string;
}