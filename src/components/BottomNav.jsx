import { Radar, Activity, BookOpen, History, Settings } from "lucide-react";

const TABS = [
  { id: "detector", label: "Detect", Icon: Radar },
  { id: "monitor", label: "Monitor", Icon: Activity },
  { id: "guide", label: "Guide", Icon: BookOpen },
  { id: "log", label: "Log", Icon: History },
  { id: "settings", label: "Settings", Icon: Settings },
];

export default function BottomNav({ activeTab, onChange, darkMode }) {
  return (
    <nav
      className={
        (darkMode
          ? "bg-zinc-950/95 border-zinc-900"
          : "bg-white/95 border-zinc-200") +
        " border-t backdrop-blur-xl pt-2 pb-3 px-2 flex items-end justify-around"
      }
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = id === activeTab;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="relative flex-1 flex flex-col items-center gap-1 py-1.5 group"
          >
            <span
              className={
                "absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full transition-all " +
                (active ? "bg-emerald-400" : "bg-transparent")
              }
            />
            <Icon
              size={20}
              className={
                "transition-colors " +
                (active
                  ? "text-emerald-400"
                  : darkMode
                  ? "text-zinc-500 group-hover:text-zinc-300"
                  : "text-zinc-500 group-hover:text-zinc-700")
              }
            />
            <span
              className={
                "text-[10px] font-medium tracking-wide transition-colors " +
                (active
                  ? "text-emerald-400"
                  : darkMode
                  ? "text-zinc-500"
                  : "text-zinc-500")
              }
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
