import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { PaymentCreateInput, PaymentOut, PaymentRefundInput } from "@/types/payment";

export interface AdminPaymentListParams {
  page?: number;
  page_size?: number;
  client_id?: string;
  search?: string;
  status?: string;
  billing_type?: string;
  start_date?: string;
  end_date?: string;
  synced?: boolean;
}

export const paymentService = {
  // ═══════════════════════════════════════════════════════════════
  // Cliente
  // ═══════════════════════════════════════════════════════════════

  createCharge: (payload: PaymentCreateInput) =>
    api.post<PaymentOut>("/payments/create-charge", payload).then((r) => r.data),

  listMine: (page = 1, pageSize = 20) =>
    api
      .get<PageOut<PaymentOut>>("/payments/my-payments", { params: { page, page_size: pageSize } })
      .then((r) => r.data),

  getMine: (paymentId: string) =>
    api.get<PaymentOut>(`/payments/my-payments/${paymentId}`).then((r) => r.data),

  // ═══════════════════════════════════════════════════════════════
  // Admin
  // ═══════════════════════════════════════════════════════════════

  listAll: (params: AdminPaymentListParams) =>
    api.get<PageOut<PaymentOut>>("/payments/list-all", { params }).then((r) => r.data),

  sync: (paymentId: string) => api.post<PaymentOut>(`/payments/${paymentId}/sync`).then((r) => r.data),

  refund: (paymentId: string, payload: PaymentRefundInput) =>
    api.post<PaymentOut>(`/payments/${paymentId}/refund`, payload).then((r) => r.data),
};