import { api } from "./api";
import type { AvailabilitySlotOut } from "@/types/schedule";

export const availabilityService = {
  getForEmployee: (employeeId: string, serviceId: string, date: string) =>
    api
      .get<AvailabilitySlotOut[]>(`/availability/employee/${employeeId}`, {
        params: { service_id: serviceId, date },
      })
      .then((r) => r.data),
};
