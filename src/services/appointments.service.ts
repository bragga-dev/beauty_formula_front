/**
 * ⚠️ A API do backend ainda não expõe endpoints de agendamento
 * (criação/listagem/cancelamento de Appointment) — só existe consulta
 * de disponibilidade (`availabilityService`). Esta camada fica isolada
 * e pronta para receber a integração real assim que o endpoint existir,
 * sem precisar tocar nas telas que já a consomem.
 */
import type { AvailabilitySlotOut } from "@/types/schedule";

export interface CreateAppointmentInput {
  serviceId: string;
  employeeId: string;
  slot: AvailabilitySlotOut;
}

export const appointmentsService = {
  // TODO: trocar por `api.post("/appointments/", payload)` quando o
  // backend implementar o endpoint de criação de agendamento.
  create: async (_payload: CreateAppointmentInput): Promise<never> => {
    throw new Error(
      "O agendamento online ainda não está disponível — em breve! Fale conosco pelo WhatsApp para agendar.",
    );
  },
};
