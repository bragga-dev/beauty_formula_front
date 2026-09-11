export function formatCurrencyBRL(value: string | number): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  return numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${rest}min`;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR");
}

export function formatTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Formata uma data (yyyy-mm-dd) como o mês de competência, ex.: "ago/2026". */
export function formatMonthYear(value: string): string {
  const date = new Date(`${value.slice(0, 7)}-02T00:00:00`);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "");
}

/** yyyy-mm-dd (dia 1) a partir de um valor de <input type="month"> (yyyy-mm). */
export function monthInputToDate(value: string): string {
  return `${value}-01`;
}

/** yyyy-mm a partir de um yyyy-mm-dd, pro valor de <input type="month">. */
export function dateToMonthInput(value: string): string {
  return value.slice(0, 7);
}

export function initials(firstName?: string | null, lastName?: string | null): string {
  const a = firstName?.[0] ?? "";
  const b = lastName?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}