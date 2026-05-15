import { ArrowLeft, MoreVertical, Bell, Menu } from "lucide-react";

// Two header variants used across screens:
//   <AppHeader variant="dashboard" greeting="Hello, User" subtitle="System is monitoring" />
//     → hamburger left, greeting + subtitle centre/left, bell right.
//   <AppHeader title="Notifications" onBack={fn} />
//     → back arrow, centred title, optional kebab right.

export default function AppHeader({
  variant = "title",
  title,
  greeting,
  subtitle,
  onBack,
  onMenu,
  onBell,
  onKebab,
  bellBadge,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 pt-3 pb-3 flex items-center gap-3">
      {variant === "dashboard" ? (
        <>
          {onMenu && (
            <IconBtn onClick={onMenu} aria="Menu">
              <Menu size={20} />
            </IconBtn>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-slate-900 truncate leading-tight">
              {greeting}
            </div>
            {subtitle && (
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
          {onBell && (
            <IconBtn onClick={onBell} aria="Notifications">
              <div className="relative">
                <Bell size={20} />
                {bellBadge ? (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                    {bellBadge > 9 ? "9+" : bellBadge}
                  </span>
                ) : null}
              </div>
            </IconBtn>
          )}
        </>
      ) : (
        <>
          {onBack && (
            <IconBtn onClick={onBack} aria="Back">
              <ArrowLeft size={20} />
            </IconBtn>
          )}
          <div className="flex-1 text-center text-base font-bold text-slate-900 truncate">
            {title}
          </div>
          {onKebab ? (
            <IconBtn onClick={onKebab} aria="More">
              <MoreVertical size={18} />
            </IconBtn>
          ) : (
            <div className="w-10" />
          )}
        </>
      )}
    </header>
  );
}

function IconBtn({ children, onClick, aria }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className="w-10 h-10 -m-2 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
    >
      {children}
    </button>
  );
}
