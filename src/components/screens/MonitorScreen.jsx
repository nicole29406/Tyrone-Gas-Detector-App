import { Power, TrendingUp, Wifi } from "lucide-react";
import StatusPill from "../StatusPill";
import {
  STATUS,
  statusAccent,
  statusForReading,
  formatReading,
  unitLabel,
} from "../../lib/simulator";

export default function MonitorScreen({
  monitoringOn,
  toggleMonitoring,
  liveReading,
  history,
  threshold,
  units,
  connectedSensor,
}) {
  const status = statusForReading(liveReading, threshold);
  const accent = statusAccent(status);

  // SVG history graph
  const W = 340;
  const H = 120;
  const max = Math.max(threshold * 1.5, 200, ...history, 1);
  const points = history
    .map((v, i) => {
      const x = (i / Math.max(history.length - 1, 1)) * W;
      const y = H - (v / max) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const thresholdY = H - (threshold / max) * H;

  return (
    <div className="flex-1 flex flex-col px-5 pt-3 pb-5 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] tracking-[0.3em] text-zinc-500">
          LIVE MONITOR
        </div>
        <div className="text-[10px] tracking-widest text-zinc-500 flex items-center gap-1">
          <Wifi size={10} className={connectedSensor ? "text-emerald-400" : ""} />
          {connectedSensor ? "LINKED" : "SIMULATED"}
        </div>
      </div>

      <div className="rounded-3xl bg-zinc-900/60 ring-1 ring-zinc-800 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-zinc-400 mb-1">Current Reading</div>
            <div className="flex items-baseline gap-2">
              <span
                className={
                  "font-mono tabular-nums text-5xl font-bold " + accent.text
                }
              >
                {monitoringOn ? formatReading(liveReading, units) : "----"}
              </span>
              <span className="text-xs tracking-widest text-zinc-500">
                {unitLabel(units)}
              </span>
            </div>
          </div>
          <StatusPill status={monitoringOn ? status : STATUS.SAFE} />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1.5">
            <span className="flex items-center gap-1">
              <TrendingUp size={11} /> 60s history
            </span>
            <span>Threshold: {threshold} PPM</span>
          </div>
          <svg
            width="100%"
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="rounded-xl bg-black/40 ring-1 ring-zinc-800"
          >
            {/* Threshold line */}
            <line
              x1={0}
              x2={W}
              y1={thresholdY}
              y2={thresholdY}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.7"
            />
            {/* Fill */}
            {history.length > 1 && (
              <polygon
                fill={accent.stroke}
                opacity="0.15"
                points={`0,${H} ${points} ${W},${H}`}
              />
            )}
            {/* Line */}
            {history.length > 1 && (
              <polyline
                fill="none"
                stroke={accent.stroke}
                strokeWidth="1.8"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={points}
              />
            )}
            {/* Empty state */}
            {history.length <= 1 && (
              <text
                x={W / 2}
                y={H / 2 + 4}
                textAnchor="middle"
                fontSize="10"
                fill="#52525b"
                fontFamily="monospace"
              >
                {monitoringOn ? "BUFFERING…" : "MONITOR OFF"}
              </text>
            )}
          </svg>
        </div>
      </div>

      <button
        onClick={toggleMonitoring}
        className={
          "mt-5 w-full rounded-2xl py-4 font-bold tracking-[0.3em] text-sm transition-all flex items-center justify-center gap-2 " +
          (monitoringOn
            ? "bg-red-500/15 text-red-400 ring-1 ring-red-400/50"
            : "bg-emerald-500 text-black ring-1 ring-emerald-300 shadow-glow-emerald active:scale-[0.98]")
        }
      >
        <Power size={16} />
        {monitoringOn ? "STOP MONITORING" : "START MONITORING"}
      </button>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat label="Min" value={history.length ? Math.min(...history) : "—"} />
        <Stat
          label="Avg"
          value={
            history.length
              ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
              : "—"
          }
        />
        <Stat label="Peak" value={history.length ? Math.max(...history) : "—"} />
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-zinc-500">
        Live monitoring runs a simulated reading loop every second. With a real
        Bluetooth sensor paired, this view would graph the sensor's PPM stream
        and trigger the alarm when the threshold is breached.
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-zinc-900/60 ring-1 ring-zinc-800 p-3 text-center">
      <div className="text-[10px] tracking-widest text-zinc-500">{label}</div>
      <div className="font-mono tabular-nums text-zinc-100 font-bold mt-0.5">
        {value}
      </div>
    </div>
  );
}
