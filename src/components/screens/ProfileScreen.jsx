import {
  User,
  Bell,
  Phone,
  Lock,
  Settings as SettingsIcon,
  Info,
  LogOut,
  Mail,
} from "lucide-react";
import Card from "../ui/Card";
import MenuRow from "../ui/MenuRow";

function Avatar({ name, size = 64 }) {
  const initials = (name || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full bg-brand-100 ring-4 ring-white text-brand-700 font-bold flex items-center justify-center shadow-card"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials || <User size={size * 0.4} />}
    </div>
  );
}

export default function ProfileScreen({ user, onNavigate, onLogout }) {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-50">
      {/* User card */}
      <Card className="flex items-center gap-4">
        <Avatar name={user?.fullName} />
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-slate-900 truncate">
            {user?.fullName || "Guest user"}
          </div>
          <div className="text-[12px] text-slate-500 truncate flex items-center gap-1.5">
            <Mail size={12} /> {user?.email || "—"}
          </div>
          <div className="text-[12px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
            <Phone size={12} /> {user?.phone || "—"}
          </div>
        </div>
      </Card>

      {/* Menu */}
      <Card padded={false} className="mt-4 divide-y divide-slate-100 overflow-hidden">
        <MenuRow
          icon={User}
          label="Personal Information"
          onClick={() => onNavigate("personal-info")}
        />
        <MenuRow
          icon={Bell}
          label="Notification Preferences"
          onClick={() => onNavigate("notification-prefs")}
        />
        <MenuRow
          icon={Phone}
          label="Emergency Contacts"
          onClick={() => onNavigate("emergency-contacts")}
        />
        <MenuRow
          icon={Lock}
          label="Security"
          onClick={() => onNavigate("security")}
        />
        <MenuRow
          icon={SettingsIcon}
          label="System Settings"
          onClick={() => onNavigate("system-settings")}
        />
        <MenuRow icon={Info} label="About" onClick={() => onNavigate("about")} />
      </Card>

      <button
        onClick={onLogout}
        className="mt-4 w-full bg-white border border-red-100 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-red-600 font-semibold text-[14px] hover:bg-red-50 active:bg-red-100 transition-colors"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
