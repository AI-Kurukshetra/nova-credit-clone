import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  className?: string;
}

/** Solid arc color by risk tier. */
function arcStroke(score: number): string {
  if (score >= 750) return "#34d399";
  if (score >= 670) return "#6366f1";
  if (score >= 580) return "#fbbf24";
  return "#fb7185";
}

/** Tailwind text-color class for the score number. */
function scoreTextClass(score: number): string {
  if (score >= 750) return "text-emerald-600";
  if (score >= 670) return "text-indigo-500";
  if (score >= 580) return "text-amber-600";
  return "text-rose-500";
}

/** Risk tier label. */
function tierLabel(score: number): string {
  if (score >= 750) return "Excellent";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  return "Poor";
}

/** Tier badge styling. */
function tierBadgeClass(score: number): string {
  if (score >= 750) return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (score >= 670) return "border-indigo-300 bg-indigo-50 text-indigo-700";
  if (score >= 580) return "border-amber-300 bg-amber-50 text-amber-700";
  return "border-rose-300 bg-rose-50 text-rose-700";
}

/*
 * SVG geometry â€” everything fits inside the viewBox with no overflow.
 *
 * viewBox : "0 0 200 130"
 * Center  : (100, 100)
 * Radius  : 80
 * Stroke  : 12  (half-stroke = 6)
 *
 * Left end : (20, 100)   Right end: (180, 100)
 * Top      : (100, 20)   with stroke â†’ y = 14
 * Bottom   : 100 + 22 (text) = 122
 *
 * Everything fits comfortably within 200Ã—130.
 */

const CX = 100;
const CY = 100;
const R = 80;
const SW = 12;
const LX = CX - R; // 20
const RX = CX + R; // 180

function arcPoint(fraction: number): { x: number; y: number } {
  const angle = Math.PI * (1 - fraction);
  return {
    x: CX + R * Math.cos(angle),
    y: CY - R * Math.sin(angle),
  };
}

const TRACK = `M ${LX} ${CY} A ${R} ${R} 0 0 1 ${RX} ${CY}`;


export function ScoreGauge({ score, className }: ScoreGaugeProps): React.JSX.Element {
  const clamped = Math.max(300, Math.min(850, score));
  const fraction = (clamped - 300) / 550;
  const color = arcStroke(clamped);
  const dot = arcPoint(Math.max(0.02, Math.min(0.98, fraction)));
  const progress = Math.max(0, Math.min(100, fraction * 100));

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      {/* The SVG is self-contained â€” no overflow needed */}
      <svg
        className="h-[120px] w-[200px] sm:h-[156px] sm:w-[240px]"
        viewBox="0 0 200 130"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {/* Muted background track */}
        <path
          d={TRACK}
          fill="none"
          stroke="rgb(226 232 240 / 0.7)"
          strokeWidth={SW}
          strokeLinecap="round"
        />

        {/* Filled progress arc */}
        <path
          d={TRACK}
          fill="none"
          stroke={color}
          strokeWidth={SW}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${progress} 100`}
        />

        {/* Score position dot */}
        <circle
          cx={dot.x}
          cy={dot.y}
          r="6"
          fill={color}
          stroke="rgb(255 255 255)"
          strokeWidth="2.5"
        />

        {/* Score number */}
        <text
          x={CX}
          y={CY - 16}
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          className={scoreTextClass(clamped)}
          fontSize="42"
          fontWeight="700"
          letterSpacing="-0.04em"
        >
          {clamped}
        </text>

        {/* Sublabel */}
        <text
          x={CX}
          y={CY - 16 + 22}
          textAnchor="middle"
          fill="rgb(100 116 139 / 0.9)"
          fontSize="7.5"
          fontWeight="700"
          letterSpacing="0.18em"
        >
          CREDITBRIDGE SCORE
        </text>

        {/* 300 label */}
        <text
          x={LX}
          y={CY + 20}
          textAnchor="middle"
          fill="rgb(100 116 139 / 0.7)"
          fontSize="10"
          fontWeight="600"
        >
          300
        </text>

        {/* 850 label */}
        <text
          x={RX}
          y={CY + 20}
          textAnchor="middle"
          fill="rgb(100 116 139 / 0.7)"
          fontSize="10"
          fontWeight="600"
        >
          850
        </text>
      </svg>

      {/* Tier badge */}
      <div
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
          tierBadgeClass(clamped),
        )}
      >
        {tierLabel(clamped)}
      </div>
    </div>
  );
}



