import { api } from "./api";
import type { AvailabilitySlotOut } from "@/types/schedule";
import type { EmployeeTeamOut } from "@/types/employee";

export const availabilityService = {
  getForEmployee: (employeeId: string, serviceId: string, date: string) =>
    api
      .get<AvailabilitySlotOut[]>(`/availability/employee/${employeeId}`, {
        params: { service_id: serviceId, date },
      })
      .then((r) => r.data),

  // Só devolve profissionais que atendem o serviço E têm pelo menos um
  // horário livre na janela de agendamento — já vem pronto pra Etapa 2
  // do fluxo (seleção de profissional), sem precisar filtrar no client.
  getEligibleEmployees: (serviceId: string) =>
    api.get<EmployeeTeamOut[]>(`/availability/eligible-employees/${serviceId}`).then((r) => r.data),
};