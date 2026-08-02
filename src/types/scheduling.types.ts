import type { ServiceOut } from "./service";
import type { EmployeeOut } from "./employee";

export type SchedulingStatus = "confirmed" | "completed" | "canceled" | "no_show" | "rescheduled";

export interface SchedulingOut {
  id: string;
  service: ServiceOut;
  employee: EmployeeOut;
  scheduled_time: string;
  status: SchedulingStatus;
  price_at_booking: string;
  duration_at_booking: number;
  notes?: string | null;
  canceled_at?: string | null;
  canceled_reason?: string | null;
  rescheduled_to_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchedulingCreateInput {
  service_id: string;
  employee_id: string;
  scheduled_time: string;
  notes?: string;
}

export interface SchedulingCancelInput {
  reason: string;
}