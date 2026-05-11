import { Bluetooth, BluetoothConnected, Radiation } from "lucide-react";
import { Avatar } from "./AuthScreen";

export default function Header({
  connectedSensor,
  onOpenSensorPair,
  user,
  onOpenSettings,
  darkMode,
}) {
  const Icon = connectedSensor ? BluetoothConnected : Bluetooth;
  return (
    <header
      className={
        (darkMode
          ? "bg-zinc-950/90 border-zinc-900"
          : "bg-white/90 border-zinc-200") +
        " sticky top-0 z-30 backdrop-blur-xl border-b px-5 pt-5 pb-3 flex items-center justify-between gap-2"
      }
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative w-8 h-8 rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/40 flex items-center justify-center shrink-0">
          <Radiation className="w-4.5 h-4.5 text-emerald-400" size={18} />
          <span className="absolute inset-0 rounded-lg bg-emerald-400/10 animate-ping-slow" />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-[10px] tracking-[0.25em] text-emerald-400 font-semibold">
            TYRONE
          </div>
          <div
            className={
              (darkMode ? "text-zinc-100" : "text-zinc-900") +
              " text-sm font-bold tracking-wider"
            }
          >
            DETECTOR
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenSensorPair}
          className={
            (connectedSensor
              ? "bg-emerald-500/15 ring-emerald-400/50 text-emerald-400"
              : darkMode
              ? "bg-zinc-900 ring-zinc-800 text-zinc-300"
              : "bg-zinc-100 ring-zinc-300 text-zinc-700") +
            " flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ring-1 text-[11px] font-medium uppercase tracking-wider"
          }
        >
          <Icon size={13} />
          {connectedSensor ? "Linked" : "Pair"}
        </button>

        {user && (
          <button
            onClick={onOpenSettings}
            title={user.fullName}
            className="rounded-full ring-1 ring-emerald-400/40 hover:ring-emerald-400/70 transition-colors"
          >
            <Avatar name={user.fullName} size={32} />
          </button>
        )}
      </div>
    </header>
  );
}
