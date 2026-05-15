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

// Tailwind-friendly tokens for each status — used by cards, badges, banners.
export function statusAccent(status) {
  switch (status) {
    case STATUS.DANGER:
      return {
        text: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        ring: "ring-red-300",
        chip: "bg-red-100 text-red-700",
        stroke: "#dc2626",
        label: "HIGH GAS ALERT",
        subtitle: "High gas level detected!",
      };
    case STATUS.WARNING:
      return {
        text: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        ring: "ring-orange-300",
        chip: "bg-orange-100 text-orange-700",
        stroke: "#ea580c",
        label: "WARNING",
        subtitle: "Gas level is above normal.",
      };
    case STATUS.CAUTION:
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        ring: "ring-amber-300",
        chip: "bg-amber-100 text-amber-700",
        stroke: "#d97706",
        label: "CAUTION",
        subtitle: "Gas level is rising.",
      };
    case STATUS.INFO:
      return {
        text: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        ring: "ring-blue-300",
        chip: "bg-blue-100 text-blue-700",
        stroke: "#2563eb",
        label: "INFO",
        subtitle: "Informational",
      };
    default:
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        ring: "ring-emerald-300",
        chip: "bg-emerald-100 text-emerald-700",
        stroke: "#059669",
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
