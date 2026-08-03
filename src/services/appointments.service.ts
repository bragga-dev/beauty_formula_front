import { api } from "./api";
import type { PageOut } from "@/types/common";
import type { AppointmentOut } from "@/types/appointment";

/**
 * Consome a app `services` do backend (model `Scheduling`, router
 * montado em `/scheduling/`). Ver `beauty_formula/apps/services/api/scheduling.py`.
 */
export const appointmentsService = {
  // GET /scheduling/list-my-schedulings — não aceita filtro por status,
  // só `active_only`. O filtro por status (confirmado/concluído/etc.)
  // é feito no front, em cima do lote retornado — ver useAppointments.ts.
  listMine: (page = 1, page_size = 100, active_only = false) =>
    api
      .get<PageOut<AppointmentOut>>("/scheduling/list-my-schedulings", {
        params: { page, page_size, active_only },
      })
      .then((r) => r.data),

  get: (id: string) => api.get<AppointmentOut>(`/scheduling/my-schedulings/${id}`).then((r) => r.data),

  // PATCH /scheduling/cancel-my-scheduling/{id} — `reason` é obrigatório
  // e não pode ser vazio (validado no backend).
  cancel: (id: string, reason: string) =>
    api.patch<AppointmentOut>(`/scheduling/cancel-my-scheduling/${id}`, { reason }).then((r) => r.data),
};