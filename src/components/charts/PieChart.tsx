import { useId } from "react";

export interface PieChartSlice {
  label: string;
  value: number;
  /** Percentual já calculado pelo backend (0–100). Se omitido, é derivado de `value`. */
  percentage?: number;
}

interface PieChartProps {
  data: PieChartSlice[];
  /** Texto central do donut (ex.: total de atendimentos). */
  centerLabel?: string;
  centerValue?: string | number;
}

/**
 * Paleta cíclica alinhada ao design system (ink/bone/crimson/gold/...
 * definidos em `index.css`). Repete se houver mais fatias que cores.
 */
/**
 * Paleta cíclica: começa nas cores já definidas em `index.css` (design
 * system do projeto) e complementa com tons extras (teal, rosa) pra
 * suportar até 10 fatias sem repetir uma cor perto de outra parecida —
 * relatórios com bastante serviços cadastrados (ex.: salão com 8-9
 * serviços ativos) precisam de tons bem distinguíveis lado a lado.
 */
const SLICE_COLORS = [
  "var(--color-gold-400)",
  "var(--color-crimson-500)",
  "var(--color-info-500)",
  "var(--color-purple-400)",
  "var(--color-orange-500)",
  "var(--color-success-500)",
  "#14b8a6", // teal
  "#ec4899", // rosa
  "var(--color-crimson-400)",
  "var(--color-gold-600)",
];

const SIZE = 200;
const RADIUS = 80;
const STROKE = 34;
const CENTER = SIZE / 2;

function polarToCartesian(radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
}

function describeArc(radius: number, startAngle: number, endAngle: number) {
  // Fatia única (100%): arco completo não é representável com um único
  // path A-A, então desenha um círculo cheio nesse caso.
  if (endAngle - startAngle >= 359.999) {
    const start = polarToCartesian(radius, 0);
    const mid = polarToCartesian(radius, 180);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${mid.x} ${mid.y} A ${radius} ${radius} 0 1 1 ${start.x} ${start.y}`;
  }
  const start = polarToCartesian(radius, startAngle);
  const end = polarToCartesian(radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

/** Gráfico de pizza (donut) em SVG puro — sem dependência externa. */
export function PieChart({ data, centerLabel, centerValue }: PieChartProps) {
  const gradientId = useId();
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return null;
  }

  let cursor = 0;
  const slices = data.map((slice, i) => {
    const fraction = slice.value / total;
    const startAngle = cursor * 360;
    cursor += fraction;
    const endAngle = cursor * 360;
    const percentage = slice.percentage ?? fraction * 100;
    return {
      ...slice,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      path: describeArc(RADIUS, startAngle, endAngle),
      percentage,
    };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative shrink-0">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} aria-hidden="true">
          <defs>
            <clipPath id={`${gradientId}-clip`}>
              <circle cx={CENTER} cy={CENTER} r={RADIUS} />
            </clipPath>
          </defs>
          {slices.map((slice) => (
            <path
              key={slice.label}
              d={slice.path}
              fill="none"
              stroke={slice.color}
              strokeWidth={STROKE}
            />
          ))}
        </svg>
        {(centerLabel || centerValue !== undefined) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {centerValue !== undefined && (
              <span className="font-display text-2xl text-bone-50">{centerValue}</span>
            )}
            {centerLabel && <span className="text-[11px] uppercase tracking-wide text-bone-500">{centerLabel}</span>}
          </div>
        )}
      </div>

      <ul className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
                aria-hidden="true"
              />
              <span className="truncate text-bone-200">{slice.label}</span>
            </span>
            <span className="shrink-0 text-bone-500">
              {slice.value} · <span className="text-bone-300">{slice.percentage.toFixed(2)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}