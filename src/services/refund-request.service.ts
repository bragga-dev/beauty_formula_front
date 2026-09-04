import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { RefundRequestOut, RefundRequestReviewInput, RefundRequestStatus } from "@/types/refund-request";

export interface AdminRefundRequestListParams {
  page?: number;
  page_size?: number;
  status?: RefundRequestStatus;
}

export const refundRequestService = {
  // ═══════════════════════════════════════════════════════════════
  // Admin
  // ═══════════════════════════════════════════════════════════════

  listAll: (params: AdminRefundRequestListParams) =>
    api.get<PageOut<RefundRequestOut>>("/payments/refund-requests/", { params }).then((r) => r.data),

  getDetail: (refundRequestId: string) =>
    api.get<RefundRequestOut>(`/payments/refund-requests/${refundRequestId}`).then((r) => r.data),

  approve: (refundRequestId: string, payload: RefundRequestReviewInput) =>
    api
      .post<RefundRequestOut>(`/payments/refund-requests/${refundRequestId}/approve`, payload)
      .then((r) => r.data),

  reject: (refundRequestId: string, payload: RefundRequestReviewInput) =>
    api
      .post<RefundRequestOut>(`/payments/refund-requests/${refundRequestId}/reject`, payload)
      .then((r) => r.data),

  // ═══════════════════════════════════════════════════════════════
  // Cliente
  // ═══════════════════════════════════════════════════════════════

  listMine: (page = 1, pageSize = 20) =>
    api
      .get<PageOut<RefundRequestOut>>("/payments/refund-requests/my-refund-requests", {
        params: { page, page_size: pageSize },
      })
      .then((r) => r.data),
};