import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ratingsService } from "@/services/ratings.service";
import type { PageOut } from "@/types/common";
import type {
  AdminRatingFilters,
  AverageRatingCreateInput,
  AverageRatingPrivateOut,
  AverageRatingUpdateInput,
  RatingValue,
} from "@/types/rating";

export function useMyRatings() {
  return useQuery({
    queryKey: ["ratings", "mine"],
    queryFn: () => ratingsService.listMine(1, 100),
  });
}

export function useServiceRatingSummary(serviceId?: string) {
  return useQuery({
    queryKey: ["ratings", "service-summary", serviceId],
    queryFn: () => ratingsService.getServiceSummary(serviceId as string),
    enabled: !!serviceId,
  });
}

export function useEmployeeRatingSummary(employeeId?: string) {
  return useQuery({
    queryKey: ["ratings", "employee-summary", employeeId],
    queryFn: () => ratingsService.getEmployeeSummary(employeeId as string),
    enabled: !!employeeId,
  });
}

/** Avaliações públicas (autorizadas) de um serviço — usado na página de detalhe. */
export function useServiceRatings(serviceId?: string, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["ratings", "service-list", serviceId, page, pageSize],
    queryFn: () => ratingsService.listForService(serviceId as string, page, pageSize),
    enabled: !!serviceId,
  });
}

/** Avaliações públicas (autorizadas) de um funcionário — usado na página de detalhe. */
export function useEmployeeRatings(employeeId?: string, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["ratings", "employee-list", employeeId, page, pageSize],
    queryFn: () => ratingsService.listForEmployee(employeeId as string, page, pageSize),
    enabled: !!employeeId,
  });
}

export interface PublicRatingFilters {
  serviceId?: string;
  employeeId?: string;
  rating?: RatingValue;
}

/** Todas as avaliações autorizadas (públicas) do salão — página "Todas as Avaliações". */
export function useAllPublicRatings(filters: PublicRatingFilters, page = 1, pageSize = 12) {
  return useQuery({
    queryKey: ["ratings", "all-public", filters, page, pageSize],
    queryFn: () => ratingsService.listAllPublic(filters, page, pageSize),
  });
}

export function useRatingMutations() {
  const queryClient = useQueryClient();
  // Invalida as avaliações do cliente E os agregados (públicos) —
  // toda criação/edição/exclusão recalcula a média de serviço/funcionário.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ratings"] });
  };

  const create = useMutation({
    mutationFn: (payload: AverageRatingCreateInput) => ratingsService.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AverageRatingUpdateInput }) =>
      ratingsService.updateMine(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => ratingsService.deleteMine(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

// ═══════════════════════════════════════════════════════════════════
// Admin / Funcionário — moderação
// ═══════════════════════════════════════════════════════════════════

/** Admin recebe todas as avaliações; funcionário só as que são sobre ele mesmo (o backend restringe). */
export function useModerationRatings(filters: AdminRatingFilters, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["ratings", "moderation", filters, page, pageSize],
    queryFn: () => ratingsService.listForModeration(filters, page, pageSize),
  });
}

export function useModerationRating(id?: string) {
  return useQuery({
    queryKey: ["ratings", "moderation", "detail", id],
    queryFn: () => ratingsService.getForModeration(id as string),
    enabled: !!id,
  });
}

export function useRatingModerationMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ratings"] });
  };

  // Toggle otimista: atualiza `is_authorized` no cache antes da resposta
  // do servidor, pra UI reagir na hora. Reverte se a request falhar.
  function useToggleAuthorized(mutationFn: (id: string) => Promise<AverageRatingPrivateOut>, nextValue: boolean) {
    return useMutation({
      mutationFn,
      onMutate: async (id: string) => {
        await queryClient.cancelQueries({ queryKey: ["ratings", "moderation"] });
        const previous = queryClient.getQueriesData<PageOut<AverageRatingPrivateOut>>({
          queryKey: ["ratings", "moderation"],
        });

        queryClient.setQueriesData<PageOut<AverageRatingPrivateOut>>(
          { queryKey: ["ratings", "moderation"] },
          (old) => {
            if (!old || !Array.isArray(old.items)) return old;
            return {
              ...old,
              items: old.items.map((item) => (item.id === id ? { ...item, is_authorized: nextValue } : item)),
            };
          },
        );

        return { previous };
      },
      onError: (_err, _id, context) => {
        context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      },
      onSettled: invalidate,
    });
  }

  const authorize = useToggleAuthorized(ratingsService.authorize, true);
  const revoke = useToggleAuthorized(ratingsService.revoke, false);

  const remove = useMutation({
    mutationFn: (id: string) => ratingsService.removeAsAdmin(id),
    onSuccess: invalidate,
  });

  return { authorize, revoke, remove };
}