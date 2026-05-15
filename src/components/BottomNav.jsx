import { Home, Bell, History, User } from "lucide-react";

const TABS = [
  { id: "home", label: "Home", Icon: Home },
  { id: "alerts", label: "Alerts", Icon: Bell },
  { id: "history", label: "History", Icon: History },
  { id: "profile", label: "Profile", Icon: User },
];

export default function BottomNav({ activeTab, onChange, alertBadge }) {
  return (
    <nav className="bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 pb-3 pt-2 px-2 flex items-end justify-around shrink-0">
      {TABS.map(({ id, label, Icon }) => {
        const active = id === activeTab;
        const showBadge = id === "alerts" && alertBadge > 0;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="relative flex-1 flex flex-col items-center gap-1 py-1.5"
          >
            <div className="relative">
              <Icon
                size={20}
                className={
                  "transition-colors " +
                  (active ? "text-brand-300" : "text-slate-500")
                }
                strokeWidth={active ? 2.2 : 1.7}
              />
              {showBadge && (
                <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                  {alertBadge > 9 ? "9+" : alertBadge}
                </span>
              )}
            </div>
            <span
              className={
                "text-[10px] font-medium transition-colors " +
                (active ? "text-brand-300 font-semibold" : "text-slate-500")
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
