/**
 * Calendário mensal de um funcionário — espelha `employee_calendar_schema.py`.
 * Endpoint: `GET /availability/employee/{employee_id}/calendar?month=yyyy-mm-dd`
 * (ver `services/api/availability.py`). Só admin.
 */

export interface WorkingHoursBlockOut {
  start_time: string;
  end_time: string;
}

export interface TimeOffBlockOut {
  id: string;
  block_type: string;
  is_recurring: boolean;
  start_time?: string | null;
  end_time?: string | null;
}

export interface SchedulingSummaryOut {
  id: string;
  start_time: string;
  end_time: string;
  service_name: string;
  client_name: string;
  status: string;
}

export interface EmployeeCalendarDayOut {
  date: string; // yyyy-mm-dd
  weekday: number; // 0 = segunda ... 6 = domingo
  weekday_label: string;
  is_within_booking_window: boolean;
  working_hours: WorkingHoursBlockOut[];
  time_off_blocks: TimeOffBlockOut[];
  schedulings: SchedulingSummaryOut[];
  has_open_slots: boolean;
}

export interface EmployeeCalendarOut {
  employee_id: string;
  employee_name: string;
  month: string; // yyyy-mm-01
  booking_window_days: number;
  days: EmployeeCalendarDayOut[];
}

/** Admin ajusta a janela de agendamento de um funcionário (1 a 365 dias). */
export interface EmployeeBookingWindowUpdateInput {
  booking_window_days: number;
}

export interface EmployeeBookingWindowOut {
  employee_id: string;
  booking_window_days: number;
}

/**
 * Versão pública do calendário mensal (sem auth) — mesmo expediente e
 * bloqueios da view admin, mas troca `schedulings` (que leva `client_name`)
 * pelos intervalos realmente livres do dia (`free_intervals`), já
 * descontando expediente, bloqueios e agendamentos existentes.
 * Endpoint: `GET /availability/employee/{employee_id}/public-calendar?month=yyyy-mm-dd`
 */
export interface FreeIntervalOut {
  start_time: string;
  end_time: string;
}

export interface PublicEmployeeCalendarDayOut {
  date: string; // yyyy-mm-dd
  weekday: number; // 0 = segunda ... 6 = domingo
  weekday_label: string;
  is_within_booking_window: boolean;
  working_hours: WorkingHoursBlockOut[];
  time_off_blocks: TimeOffBlockOut[];
  free_intervals: FreeIntervalOut[];
  has_open_slots: boolean;
}

export interface PublicEmployeeCalendarOut {
  employee_id: string;
  employee_name: string;
  month: string; // yyyy-mm-01
  booking_window_days: number;
  days: PublicEmployeeCalendarDayOut[];
}