import type { ServiceOut } from "./service";
import type { EmployeeOut } from "./employee";

/** Espelha `RatingEnum` do backend (1 a 5 estrelas). */
export type RatingValue = 1 | 2 | 3 | 4 | 5;

/**
 * Visão privada de uma avaliação (dona/cliente ou admin) — corresponde
 * ao schema `AverageRatingPrivateOut`.
 */
export interface AverageRatingPrivateOut {
  id: string;
  scheduling_id: string;
  service: ServiceOut;
  employee: EmployeeOut;
  rating: RatingValue;
  rating_label: string;
  comment?: string | null;
  is_authorized: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Visão pública de uma avaliação já autorizada — corresponde ao schema
 * `AverageRatingOut`.
 */
export interface AverageRatingOut {
  id: string;
  service: ServiceOut;
  employee: EmployeeOut;
  rating: RatingValue;
  rating_label: string;
  comment?: string | null;
  created_at: string;
}

export interface AverageRatingCreateInput {
  scheduling_id: string;
  rating: RatingValue;
  comment?: string;
}

export interface AverageRatingUpdateInput {
  rating?: RatingValue;
  comment?: string;
}

/** Média/total de avaliações de um serviço ou funcionário — somente leitura. */
export interface RatingSummaryOut {
  average_rating: string;
  total_reviews: number;
  updated_at?: string | null;
}