import { ChevronRight } from "lucide-react";

export default function MenuRow({
  icon: Icon,
  label,
  hint,
  trailing,
  onClick,
  destructive = false,
  iconBg = "bg-brand-500/15",
  iconColor = "text-brand-300",
  showChevron = true,
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-800/60 active:bg-slate-800 transition-colors"
    >
      <div
        className={
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 " +
          (destructive ? "bg-red-500/15" : iconBg)
        }
      >
        <Icon
          size={17}
          className={destructive ? "text-red-400" : iconColor}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={
            "text-[14px] font-semibold truncate " +
            (destructive ? "text-red-400" : "text-slate-100")
          }
        >
          {label}
        </div>
        {hint && (
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            {hint}
          </div>
        )}
      </div>
      {trailing != null
        ? trailing
        : showChevron && <ChevronRight size={16} className="text-slate-500" />}
    </button>
  );
}
