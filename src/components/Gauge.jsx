import { statusAccent, formatReading, unitLabel } from "../lib/simulator";

// Circular SVG gauge. `ppm` is the live reading; `max` is the gauge ceiling.
// During `scanning`, an extra radar sweep + pulse animation overlays the gauge.
export default function Gauge({
  ppm,
  max = 1000,
  status,
  units,
  scanning,
  label,
}) {
  const size = 260;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, ppm / max));
  const accent = statusAccent(status);

  return (
    <div
      className={
        "relative mx-auto rounded-full transition-shadow duration-500 " +
        (scanning ? "shadow-glow-emerald" : accent.glow)
      }
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gaugeStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent.stroke} stopOpacity="0.9" />
            <stop offset="100%" stopColor={accent.stroke} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#27272a"
          strokeWidth={stroke}
        />

        {/* Tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const inner = r - stroke / 2 - 8;
          const outer = r - stroke / 2 - 2;
          const x1 = size / 2 + Math.cos(rad) * inner;
          const y1 = size / 2 + Math.sin(rad) * inner;
          const x2 = size / 2 + Math.cos(rad) * outer;
          const y2 = size / 2 + Math.sin(rad) * outer;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#3f3f46"
              strokeWidth={i % 5 === 0 ? 1.5 : 0.7}
              opacity={i % 5 === 0 ? 0.9 : 0.5}
            />
          );
        })}

        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gaugeStroke)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />

        {/* Radar sweep while scanning */}
        {scanning && (
          <g
            style={{
              transformOrigin: `${size / 2}px ${size / 2}px`,
              animation: "spin 1.2s linear infinite",
            }}
          >
            <defs>
              <linearGradient id="sweep" x1="50%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <path
              d={`M ${size / 2} ${size / 2} L ${size / 2 + r} ${
                size / 2
              } A ${r} ${r} 0 0 0 ${size / 2 + r * Math.cos(-Math.PI / 4)} ${
                size / 2 + r * Math.sin(-Math.PI / 4)
              } Z`}
              fill="url(#sweep)"
              opacity="0.6"
            />
          </g>
        )}
      </svg>

      {/* Center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-[10px] tracking-[0.3em] text-zinc-500 mb-1">
          {label || "GAS LEVEL"}
        </div>
        <div
          className={
            "font-mono tabular-nums text-6xl font-bold leading-none " +
            accent.text +
            (scanning ? " animate-pulse-fast" : "")
          }
        >
          {scanning ? "----" : formatReading(ppm, units)}
        </div>
        <div className="text-xs tracking-widest text-zinc-500 mt-2">
          {unitLabel(units)}
        </div>
      </div>
    </div>
  );
}
