import { useQuery } from "@tanstack/react-query";
import { servicesService } from "@/services/services.service";

export function usePublicServices(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["services", "public", page, pageSize],
    queryFn: () => servicesService.listPublic(page, pageSize),
  });
}

export function useServiceDetail(serviceId?: string) {
  return useQuery({
    queryKey: ["services", "detail", serviceId],
    queryFn: () => servicesService.detail(serviceId as string),
    enabled: !!serviceId,
  });
}
