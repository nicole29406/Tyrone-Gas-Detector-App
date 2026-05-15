import { Signal, Wifi, BatteryFull } from "lucide-react";

// Wraps the app in a phone-shaped container with a mock iOS-style status bar
// at the top, matching the design mockup. On a real phone the OS status bar
// covers the top; on desktop we render this faux bar so the layout looks
// identical to the screenshot.

export default function PhoneFrame({ darkMode, children }) {
  const isDark = !!darkMode;
  return (
    <div
      className={
        (isDark
          ? "bg-black text-zinc-100"
          : "bg-slate-100 text-slate-900") +
        " min-h-full w-full flex items-center justify-center sm:p-6"
      }
    >
      <div
        className={
          (isDark
            ? "bg-zinc-950 ring-zinc-800"
            : "bg-slate-50 ring-slate-200") +
          " relative w-full sm:max-w-[420px] sm:h-[860px] h-screen sm:rounded-[44px] overflow-hidden ring-1 sm:ring-4 flex flex-col shadow-card-lg"
        }
      >
        <MockStatusBar darkMode={isDark} />
        {children}
      </div>
    </div>
  );
}

function MockStatusBar({ darkMode }) {
  return (
    <div
      className={
        (darkMode ? "bg-zinc-950 text-zinc-300" : "bg-slate-50 text-slate-700") +
        " hidden sm:flex h-6 px-6 items-center justify-between text-[11px] font-semibold tracking-wide shrink-0"
      }
    >
      <span className="tabular-nums">9:41</span>
      <div className="flex items-center gap-1">
        <Signal size={12} />
        <Wifi size={12} />
        <BatteryFull size={14} />
      </div>
    </div>
  );
}
