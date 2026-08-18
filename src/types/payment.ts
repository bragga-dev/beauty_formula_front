/**
 * Tipos de pagamento — espelham `payment_schema.py` do backend.
 *
 * A API aceita billing_type UNDEFINED/BOLETO/PIX/CREDIT_CARD, mas o front
 * só expõe PIX e CREDIT_CARD pro cliente (decisão de produto — boleto fica
 * de fora da UI mesmo existindo no backend).
 */
export type PaymentBillingType = "PIX" | "CREDIT_CARD";

/** Espelha `Payment.PaymentStatus` — status reais que a Asaas retorna. */
export type PaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "REFUND_REQUESTED"
  | "REFUND_IN_PROGRESS"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS"
  | "CANCELLED";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  RECEIVED: "Recebido",
  CONFIRMED: "Confirmado",
  OVERDUE: "Vencido",
  REFUNDED: "Reembolsado",
  RECEIVED_IN_CASH: "Recebido em dinheiro",
  REFUND_REQUESTED: "Reembolso solicitado",
  REFUND_IN_PROGRESS: "Reembolso em andamento",
  CHARGEBACK_REQUESTED: "Chargeback solicitado",
  CHARGEBACK_DISPUTE: "Disputa de chargeback",
  AWAITING_CHARGEBACK_REVERSAL: "Aguardando reversão de chargeback",
  DUNNING_REQUESTED: "Negativação solicitada",
  DUNNING_RECEIVED: "Negativação recebida",
  AWAITING_RISK_ANALYSIS: "Em análise antifraude",
  CANCELLED: "Cancelado",
};

export const PAYMENT_STATUS_BADGE: Record<
  PaymentStatus,
  "neutral" | "success" | "danger" | "gold" | "crimson" | "info" | "purple" | "orange"
> = {
  PENDING: "gold",
  RECEIVED: "success",
  CONFIRMED: "success",
  OVERDUE: "danger",
  REFUNDED: "purple",
  RECEIVED_IN_CASH: "success",
  REFUND_REQUESTED: "purple",
  REFUND_IN_PROGRESS: "purple",
  CHARGEBACK_REQUESTED: "orange",
  CHARGEBACK_DISPUTE: "orange",
  AWAITING_CHARGEBACK_REVERSAL: "orange",
  DUNNING_REQUESTED: "danger",
  DUNNING_RECEIVED: "danger",
  AWAITING_RISK_ANALYSIS: "info",
  CANCELLED: "neutral",
};

export const PAYMENT_BILLING_TYPE_LABELS: Record<PaymentBillingType, string> = {
  PIX: "Pix",
  CREDIT_CARD: "Cartão de Crédito",
};

/** Corresponde ao `PaymentResponseSchema` do backend. */
export interface PaymentOut {
  id: string;
  scheduling_id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  service_name?: string | null;
  scheduled_time?: string | null;
  asaas_payment_id?: string | null;
  asaas_customer_id?: string | null;
  value: string;
  billing_type: PaymentBillingType | "BOLETO" | "UNDEFINED";
  status: PaymentStatus;
  due_date: string;
  description: string;
  external_reference?: string | null;
  invoice_url?: string | null;
  bank_slip_url?: string | null;
  pix_qr_code?: string | null;
  pix_copy_paste?: string | null;
  payment_date?: string | null;
  net_value?: string | null;
  created_at: string;
  updated_at: string;
  synced_with_asaas: boolean;
}

export interface PaymentCreateInput {
  scheduling_id: string;
  billing_type: PaymentBillingType;
  cpf_cnpj?: string;
}

export interface PaymentRefundInput {
  value?: number;
  description?: string;
}

/** Status que contam como "já pago/em processamento" pra travar nova cobrança na mesma reserva. */
const ACTIVE_PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "RECEIVED",
  "CONFIRMED",
  "RECEIVED_IN_CASH",
  "AWAITING_RISK_ANALYSIS",
];

export function isPaymentActive(payment: PaymentOut): boolean {
  return ACTIVE_PAYMENT_STATUSES.includes(payment.status);
}

export function isPaymentSettled(payment: PaymentOut): boolean {
  return payment.status === "RECEIVED" || payment.status === "CONFIRMED" || payment.status === "RECEIVED_IN_CASH";
}