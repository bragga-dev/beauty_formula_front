export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Segunda-feira",
  1: "Terça-feira",
  2: "Quarta-feira",
  3: "Quinta-feira",
  4: "Sexta-feira",
  5: "Sábado",
  6: "Domingo",
};

export interface EmployeeWorkingHoursOut {
  id: string;
  weekday: number;
  weekday_display: string;
  start_time: string;
  end_time: string;
  total_hours: number;
}

export type BlockType =
  | "lunch"
  | "break"
  | "personal"
  | "medical"
  | "day_off"
  | "vacation"
  | "other";

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  lunch: "Almoço",
  break: "Pausa",
  personal: "Pessoal",
  medical: "Médico",
  day_off: "Folga",
  vacation: "Férias",
  other: "Outro",
};

export interface EmployeeTimeOffOut {
  id: string;
  block_type: BlockType;
  weekday?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
}

export interface AvailabilitySlotOut {
  start: string;
  end: string;
}
