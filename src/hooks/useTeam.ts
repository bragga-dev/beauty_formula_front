import { useQuery } from "@tanstack/react-query";
import { teamService } from "@/services/team.service";

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
