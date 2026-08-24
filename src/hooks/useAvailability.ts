import { useQuery } from "@tanstack/react-query";
import { availabilityService } from "@/services/availability.service";

export function useAvailability(employeeId?: string, serviceId?: string, date?: string) {
  return useQuery({
    queryKey: ["availability", employeeId, serviceId, date],
    queryFn: () => availabilityService.getForEmployee(employeeId as string, serviceId as string, date as string),
    enabled: !!employeeId && !!serviceId && !!date,
  });
}

// Etapa "Profissional": só profissionais que atendem o serviço E têm
// vaga real na janela de agendamento — não só quem está vinculado.
export function useEligibleEmployees(serviceId?: string) {
  return useQuery({
    queryKey: ["availability", "eligible-employees", serviceId],
    queryFn: () => availabilityService.getEligibleEmployees(serviceId as string),
    enabled: !!serviceId,
  });
}

// Calendário mensal (admin) de um funcionário: expediente, bloqueios e
// agendamentos, dia a dia. `month` no formato yyyy-mm-dd. A query key
// (prefixo ["availability", "employee-calendar"]) é a mesma invalidada
// por `useUpdateBookingWindow`, pra recarregar depois de editar a janela.
export function useEmployeeCalendar(employeeId?: string, month?: string) {
  return useQuery({
    queryKey: ["availability", "employee-calendar", employeeId, month],
    queryFn: () => availabilityService.getEmployeeCalendar(employeeId as string, month as string),
    enabled: !!employeeId && !!month,
  });
}