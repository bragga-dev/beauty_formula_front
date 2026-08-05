import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ratingsService } from "@/services/ratings.service";
import type { AverageRatingCreateInput, AverageRatingUpdateInput } from "@/types/rating";

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