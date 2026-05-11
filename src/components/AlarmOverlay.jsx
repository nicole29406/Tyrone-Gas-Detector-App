import { AlertOctagon, BellOff, Phone } from "lucide-react";
import { formatReading, unitLabel } from "../lib/simulator";

export default function AlarmOverlay({
  ppm,
  units,
  gas,
  emergencyContact,
  onSilence,
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-red-600/30 animate-pulse-fast pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/80 via-red-950/90 to-black" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/20 ring-2 ring-red-500 flex items-center justify-center mb-5 shadow-glow-red">
          <AlertOctagon size={44} className="text-red-400" />
        </div>
        <div className="text-red-300 text-xs tracking-[0.4em] mb-2">
          GAS LEAK DETECTED
        </div>
        <div className="text-white font-mono tabular-nums text-7xl font-black leading-none">
          {formatReading(ppm, units)}
        </div>
        <div className="text-red-200 text-sm tracking-widest mt-2">
          {unitLabel(units)} · {gas || "UNKNOWN GAS"}
        </div>

        <div className="mt-8 space-y-2 text-red-100 text-sm">
          <p className="font-semibold">EVACUATE THE AREA IMMEDIATELY.</p>
          <p className="text-red-200/80">
            Do not switch on lights, appliances, or electronics.
          </p>
        </div>
      </div>

      <div className="relative p-5 pb-7 space-y-3">
        {emergencyContact && (
          <a
            href={`tel:${emergencyContact}`}
            className="flex items-center justify-center gap-2 w-full bg-white text-red-700 font-bold py-4 rounded-2xl text-sm uppercase tracking-widest"
          >
            <Phone size={16} /> Call {emergencyContact}
          </a>
        )}
        <button
          onClick={onSilence}
          className="flex items-center justify-center gap-2 w-full bg-red-950/60 ring-1 ring-red-400/40 text-red-100 font-semibold py-4 rounded-2xl text-sm uppercase tracking-widest"
        >
          <BellOff size={16} /> Silence Alarm
        </button>
      </div>
    </div>
  );
}
