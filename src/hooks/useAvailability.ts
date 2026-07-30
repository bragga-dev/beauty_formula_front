import { useQuery } from "@tanstack/react-query";
import { availabilityService } from "@/services/availability.service";

export function useAvailability(employeeId?: string, serviceId?: string, date?: string) {
  return useQuery({
    queryKey: ["availability", employeeId, serviceId, date],
    queryFn: () => availabilityService.getForEmployee(employeeId as string, serviceId as string, date as string),
    enabled: !!employeeId && !!serviceId && !!date,
  });
}
