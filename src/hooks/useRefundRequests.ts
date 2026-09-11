import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { refundRequestService, type AdminRefundRequestListParams } from "@/services/refund-request.service";
import type { RefundRequestReviewInput } from "@/types/refund-request";

// ═══════════════════════════════════════════════════════════════════
// Admin
// ═══════════════════════════════════════════════════════════════════

export function useAdminRefundRequests(filters: AdminRefundRequestListParams, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["admin", "refund-requests", filters.status, page, pageSize],
    queryFn: () => refundRequestService.listAll({ status: filters.status, page, page_size: pageSize }),
  });
}

export function useAdminRefundRequestMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "refund-requests"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  };

  const approve = useMutation({
    mutationFn: ({ refundRequestId, payload }: { refundRequestId: string; payload: RefundRequestReviewInput }) =>
      refundRequestService.approve(refundRequestId, payload),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ refundRequestId, payload }: { refundRequestId: string; payload: RefundRequestReviewInput }) =>
      refundRequestService.reject(refundRequestId, payload),
    onSuccess: invalidate,
  });

  return { approve, reject };
}

// ═══════════════════════════════════════════════════════════════════
// Cliente
// ═══════════════════════════════════════════════════════════════════

export function useMyRefundRequests(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["refund-requests", "mine", page, pageSize],
    queryFn: () => refundRequestService.listMine(page, pageSize),
  });
}