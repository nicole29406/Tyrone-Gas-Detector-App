export const GAS_TYPES = ["LPG", "Methane", "Carbon Monoxide", "Propane", "Hydrogen"];

// Four severity levels, matching the design mockup.
//   INFO    – informational events (system checks, sensor connected, etc.)
//   SAFE    – within normal range
//   CAUTION – elevated, watch carefully
//   WARNING – above normal, action recommended
//   DANGER  – exceeds threshold, alarm
export const STATUS = {
  INFO: "INFO",
  SAFE: "SAFE",
  CAUTION: "CAUTION",
  WARNING: "WARNING",
  DANGER: "DANGER",
};

// Bands (as fractions of the configured threshold):
//   0%   – 40%  : SAFE
//   40%  – 60%  : CAUTION
//   60%  – 100% : WARNING
//   >=100%      : DANGER
export function statusForReading(ppm, threshold) {
  if (ppm >= threshold) return STATUS.DANGER;
  if (ppm >= threshold * 0.6) return STATUS.WARNING;
  if (ppm >= threshold * 0.4) return STATUS.CAUTION;
  return STATUS.SAFE;
}

// Tailwind tokens for each status — designed for the dark theme.
export function statusAccent(status) {
  switch (status) {
    case STATUS.DANGER:
      return {
        text: "text-red-400",
        bg: "bg-red-500/15",
        border: "border-red-500/40",
        ring: "ring-red-500/40",
        chip: "bg-red-500/20 text-red-300",
        stroke: "#f87171",
        label: "HIGH GAS ALERT",
        subtitle: "High gas level detected!",
      };
    case STATUS.WARNING:
      return {
        text: "text-orange-400",
        bg: "bg-orange-500/15",
        border: "border-orange-500/40",
        ring: "ring-orange-500/40",
        chip: "bg-orange-500/20 text-orange-300",
        stroke: "#fb923c",
        label: "WARNING",
        subtitle: "Gas level is above normal.",
      };
    case STATUS.CAUTION:
      return {
        text: "text-amber-400",
        bg: "bg-amber-500/15",
        border: "border-amber-500/40",
        ring: "ring-amber-500/40",
        chip: "bg-amber-500/20 text-amber-300",
        stroke: "#fbbf24",
        label: "CAUTION",
        subtitle: "Gas level is rising.",
      };
    case STATUS.INFO:
      return {
        text: "text-blue-400",
        bg: "bg-blue-500/15",
        border: "border-blue-500/40",
        ring: "ring-blue-500/40",
        chip: "bg-blue-500/20 text-blue-300",
        stroke: "#60a5fa",
        label: "INFO",
        subtitle: "Informational",
      };
    default:
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/15",
        border: "border-emerald-500/40",
        ring: "ring-emerald-500/40",
        chip: "bg-emerald-500/20 text-emerald-300",
        stroke: "#34d399",
        label: "SAFE",
        subtitle: "Air is safe",
      };
  }
}

// Random scan reading: 70% safe, 25% elevated, 5% danger.
export function randomScanPpm() {
  const roll = Math.random();
  if (roll < 0.7) return Math.round(Math.random() * 80);
  if (roll < 0.95) return Math.round(120 + Math.random() * 200);
  return Math.round(400 + Math.random() * 600);
}

export function randomGas() {
  return GAS_TYPES[Math.floor(Math.random() * GAS_TYPES.length)];
}

// Smoothed random walk for the live monitoring loop.
export function nextLiveReading(previous) {
  const drift = (Math.random() - 0.48) * 30;
  let next = previous + drift;
  if (Math.random() < 0.04) next += Math.random() * 220;
  if (next < 0) next = 0;
  if (next > 1000) next = 1000;
  return Math.round(next);
}

// Subtle temperature simulator. Walks around 27 °C with small drifts.
export function nextTemperature(previous = 27) {
  const drift = (Math.random() - 0.5) * 0.3;
  let next = previous + drift;
  if (next < 18) next = 18;
  if (next > 38) next = 38;
  return Math.round(next * 10) / 10;
}

// PPM ↔ LEL%
export function ppmToLel(ppm) {
  return (ppm / 100).toFixed(1);
}
export function formatReading(ppm, units) {
  if (units === "lel") return `${ppmToLel(ppm)}%`;
  return `${ppm}`;
}
export function unitLabel(units) {
  return units === "lel" ? "LEL" : "PPM";
}
