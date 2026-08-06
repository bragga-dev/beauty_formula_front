import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ratingsService } from "@/services/ratings.service";
import type { AdminRatingFilters, AverageRatingCreateInput, AverageRatingUpdateInput } from "@/types/rating";

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

  const authorize = useMutation({
    mutationFn: (id: string) => ratingsService.authorize(id),
    onSuccess: invalidate,
  });

  const revoke = useMutation({
    mutationFn: (id: string) => ratingsService.revoke(id),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => ratingsService.removeAsAdmin(id),
    onSuccess: invalidate,
  });

  return { authorize, revoke, remove };
}