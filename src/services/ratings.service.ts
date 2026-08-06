import { api } from "./api";
import type { PageOut } from "@/types/common";
import type {
  AdminRatingFilters,
  AverageRatingCreateInput,
  AverageRatingOut,
  AverageRatingPrivateOut,
  AverageRatingUpdateInput,
  RatingSummaryOut,
} from "@/types/rating";

/**
 * Consome a app `services` do backend (model `AverageRating`, router
 * montado em `/average-ratings/`). Ver
 * `beauty_formula/apps/services/api/average_rating.py`.
 */
export const ratingsService = {
  // Cliente
  create: (payload: AverageRatingCreateInput) =>
    api.post<AverageRatingPrivateOut>("/average-ratings/create", payload).then((r) => r.data),

  listMine: (page = 1, page_size = 50) =>
    api
      .get<PageOut<AverageRatingPrivateOut>>("/average-ratings/my-ratings", { params: { page, page_size } })
      .then((r) => r.data),

  getMine: (ratingId: string) =>
    api.get<AverageRatingPrivateOut>(`/average-ratings/my-ratings/${ratingId}`).then((r) => r.data),

  updateMine: (ratingId: string, payload: AverageRatingUpdateInput) =>
    api.patch<AverageRatingPrivateOut>(`/average-ratings/my-ratings/${ratingId}`, payload).then((r) => r.data),

  deleteMine: (ratingId: string) => api.delete(`/average-ratings/my-ratings/${ratingId}`),

  // Público
  listForService: (serviceId: string, page = 1, page_size = 10) =>
    api
      .get<PageOut<AverageRatingOut>>(`/average-ratings/service/${serviceId}`, { params: { page, page_size } })
      .then((r) => r.data),

  getServiceSummary: (serviceId: string) =>
    api.get<RatingSummaryOut>(`/average-ratings/service/${serviceId}/summary`).then((r) => r.data),

  listForEmployee: (employeeId: string, page = 1, page_size = 10) =>
    api
      .get<PageOut<AverageRatingOut>>(`/average-ratings/employee/${employeeId}`, { params: { page, page_size } })
      .then((r) => r.data),

  getEmployeeSummary: (employeeId: string) =>
    api.get<RatingSummaryOut>(`/average-ratings/employee/${employeeId}/summary`).then((r) => r.data),

  // ═══════════════════════════════════════════════════════════════
  // Admin / Funcionário — moderação
  // ═══════════════════════════════════════════════════════════════

  /** Admin vê tudo; funcionário recebe só as avaliações sobre ele mesmo (filtrado no backend). */
  listForModeration: (filters: AdminRatingFilters, page = 1, page_size = 10) =>
    api
      .get<PageOut<AverageRatingPrivateOut>>("/average-ratings/admin/list", {
        params: {
          page,
          page_size,
          service_id: filters.serviceId || undefined,
          employee_id: filters.employeeId || undefined,
          client_id: filters.clientId || undefined,
          rating: filters.rating || undefined,
          is_authorized: filters.isAuthorized,
        },
      })
      .then((r) => r.data),

  getForModeration: (ratingId: string) =>
    api.get<AverageRatingPrivateOut>(`/average-ratings/admin/${ratingId}`).then((r) => r.data),

  /** Admin autoriza qualquer avaliação; funcionário só as que são sobre ele mesmo. */
  authorize: (ratingId: string) =>
    api.patch<AverageRatingPrivateOut>(`/average-ratings/admin/${ratingId}/authorize`).then((r) => r.data),

  /** Só admin — revoga a publicação de uma avaliação já autorizada. */
  revoke: (ratingId: string) =>
    api.patch<AverageRatingPrivateOut>(`/average-ratings/admin/${ratingId}/revoke`).then((r) => r.data),

  /** Só admin — exclui permanentemente. */
  removeAsAdmin: (ratingId: string) => api.delete(`/average-ratings/admin/${ratingId}`),
};