import { api } from "./api";
import type { AvailabilitySlotOut } from "@/types/schedule";
import type { EmployeeTeamOut } from "@/types/employee";
import type { EmployeeCalendarOut } from "@/types/employeeCalendar";

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

  // Calendário mensal do funcionário (expediente + bloqueios + agendamentos
  // dia a dia) pra tela de agenda do painel admin. `month` no formato
  // yyyy-mm-dd (qualquer dia do mês desejado, o back normaliza pro dia 1).
  getEmployeeCalendar: (employeeId: string, month: string) =>
    api
      .get<EmployeeCalendarOut>(`/availability/employee/${employeeId}/calendar`, {
        params: { month },
      })
      .then((r) => r.data),
};