import { api } from "./api";
import type { PageOut } from "@/types/common";
import type {
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
};