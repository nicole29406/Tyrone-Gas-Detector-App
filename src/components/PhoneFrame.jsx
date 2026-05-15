import { Signal, Wifi, BatteryFull } from "lucide-react";

// Wraps the app in a phone-shaped container. Uses dvh (dynamic viewport
// height) so the on-screen keyboard pushes content up rather than hiding it.

export default function PhoneFrame({ children }) {
  return (
    <div className="bg-black text-slate-100 min-h-[100dvh] w-full flex items-center justify-center sm:p-6">
      <div className="relative w-full sm:max-w-[420px] sm:h-[860px] h-[100dvh] bg-slate-950 ring-1 sm:ring-4 ring-slate-800 sm:rounded-[44px] overflow-hidden flex flex-col shadow-card-lg">
        <MockStatusBar />
        {children}
      </div>
    </div>
  );
}

function MockStatusBar() {
  return (
    <div className="hidden sm:flex h-6 px-6 items-center justify-between text-[11px] font-semibold tracking-wide shrink-0 bg-slate-950 text-slate-300">
      <span className="tabular-nums">9:41</span>
      <div className="flex items-center gap-1">
        <Signal size={12} />
        <Wifi size={12} />
        <BatteryFull size={14} />
      </div>
    </div>
  );
}
