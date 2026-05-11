export const GAS_TYPES = ["LPG", "Methane", "Carbon Monoxide", "Propane", "Hydrogen"];

export const STATUS = {
  SAFE: "SAFE",
  CAUTION: "CAUTION",
  DANGER: "DANGER",
};

// Returns SAFE / CAUTION / DANGER for a PPM reading given a configured threshold.
// CAUTION begins at 60% of the threshold; DANGER once reading >= threshold.
export function statusForReading(ppm, threshold) {
  if (ppm >= threshold) return STATUS.DANGER;
  if (ppm >= threshold * 0.6) return STATUS.CAUTION;
  return STATUS.SAFE;
}

export function statusAccent(status) {
  switch (status) {
    case STATUS.DANGER:
      return {
        text: "text-red-500",
        bg: "bg-red-500/10",
        ring: "ring-red-500/50",
        glow: "shadow-glow-red",
        stroke: "#ef4444",
      };
    case STATUS.CAUTION:
      return {
        text: "text-amber-400",
        bg: "bg-amber-400/10",
        ring: "ring-amber-400/50",
        glow: "shadow-glow-amber",
        stroke: "#fbbf24",
      };
    default:
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-400/10",
        ring: "ring-emerald-400/50",
        glow: "shadow-glow-emerald",
        stroke: "#34d399",
      };
  }
}

// Produces a plausible mock PPM reading. Most scans are safe; occasionally elevated.
export function randomScanPpm() {
  const roll = Math.random();
  if (roll < 0.7) return Math.round(Math.random() * 80); // 0 - 80 safe-ish
  if (roll < 0.92) return Math.round(120 + Math.random() * 200); // 120 - 320 caution band
  return Math.round(400 + Math.random() * 600); // 400 - 1000 danger
}

export function randomGas() {
  return GAS_TYPES[Math.floor(Math.random() * GAS_TYPES.length)];
}

// Smoothed random walk for the live monitoring loop. Keeps readings within [0, 1000].
export function nextLiveReading(previous) {
  const drift = (Math.random() - 0.48) * 30; // slight upward bias for drama
  let next = previous + drift;
  // Occasional spike
  if (Math.random() < 0.04) next += Math.random() * 220;
  if (next < 0) next = 0;
  if (next > 1000) next = 1000;
  return Math.round(next);
}

// PPM <-> LEL% conversion (rough demo math; real LEL depends on the gas).
// We treat 10000 PPM as 100% LEL for display purposes.
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
