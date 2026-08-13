import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentService, type AdminPaymentListParams } from "@/services/payment.service";
import type { PaymentCreateInput, PaymentRefundInput } from "@/types/payment";

// ═══════════════════════════════════════════════════════════════════
// Cliente
// ═══════════════════════════════════════════════════════════════════

/**
 * A API não tem "buscar cobrança pelo agendamento" — só lista as
 * cobranças do cliente. Busca um lote (mesma estratégia usada em
 * `useMySchedulings`) pra derivar a cobrança de um agendamento
 * específico no front.
 */
export function useMyPayments() {
  return useQuery({
    queryKey: ["payments", "mine"],
    queryFn: () => paymentService.listMine(1, 100),
  });
}

/** Cobrança mais recente vinculada a um agendamento específico, se existir. */
export function usePaymentForScheduling(schedulingId?: string) {
  const query = useMyPayments();
  const payment = schedulingId
    ? query.data?.items.find((p) => p.scheduling_id === schedulingId)
    : undefined;
  return { ...query, payment };
}

export function usePaymentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  };

  const createCharge = useMutation({
    mutationFn: (payload: PaymentCreateInput) => paymentService.createCharge(payload),
    onSuccess: invalidate,
  });

  return { createCharge };
}

// ═══════════════════════════════════════════════════════════════════
// Admin
// ═══════════════════════════════════════════════════════════════════

export function useAdminPayments(filters: AdminPaymentListParams, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["admin", "payments", filters, page, pageSize],
    queryFn: () => paymentService.listAll({ ...filters, page, page_size: pageSize }),
  });
}

export function useAdminPaymentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  };

  const sync = useMutation({
    mutationFn: (paymentId: string) => paymentService.sync(paymentId),
    onSuccess: invalidate,
  });

  const refund = useMutation({
    mutationFn: ({ paymentId, payload }: { paymentId: string; payload: PaymentRefundInput }) =>
      paymentService.refund(paymentId, payload),
    onSuccess: invalidate,
  });

  return { sync, refund };
}