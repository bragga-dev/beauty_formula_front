import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamService } from "@/services/team.service";
import type { EmployeeBookingWindowUpdateInput } from "@/types/employeeCalendar";

export function useTeam(page = 1, pageSize = 20, serviceId?: string) {
  return useQuery({
    queryKey: ["team", page, pageSize, serviceId],
    queryFn: () => teamService.list(page, pageSize, serviceId),
  });
}

export function useTeamMember(employeeId?: string) {
  return useQuery({
    queryKey: ["team", "detail", employeeId],
    queryFn: () => teamService.detail(employeeId as string),
    enabled: !!employeeId,
  });
}

/** Admin ajusta a janela de agendamento de um funcionário. Invalida o calendário (que exibe esse valor). */
export function useUpdateBookingWindow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: EmployeeBookingWindowUpdateInput }) =>
      teamService.updateBookingWindow(employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability", "employee-calendar"] });
    },
  });
}