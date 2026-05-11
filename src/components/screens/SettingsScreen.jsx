import {
  Volume2,
  Vibrate,
  Gauge as GaugeIcon,
  Moon,
  Phone,
  Bell,
  Ruler,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Users,
} from "lucide-react";
import { playTestBeep, unlockAudio } from "../../lib/audio";
import { Avatar } from "../AuthScreen";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={
        "relative w-11 h-6 rounded-full transition-colors ring-1 " +
        (checked
          ? "bg-emerald-500 ring-emerald-300"
          : "bg-zinc-800 ring-zinc-700")
      }
    >
      <span
        className={
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform " +
          (checked ? "translate-x-5" : "")
        }
      />
    </button>
  );
}

function Row({ icon: Icon, label, hint, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/30 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        {hint && <div className="text-[11px] text-zinc-500 mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsScreen({
  settings,
  setSettings,
  user,
  onLogout,
  onSwitchAccount,
}) {
  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));

  const testAlarm = () => {
    unlockAudio();
    playTestBeep();
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-5">
      <div className="text-[10px] tracking-[0.3em] text-zinc-500 mb-1">
        SETTINGS
      </div>
      <h1 className="text-xl font-bold mb-4">Preferences</h1>

      {/* Account card */}
      {user && (
        <div className="mb-4 rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 p-4 flex items-center gap-3">
          <Avatar name={user.fullName} size={44} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {user.fullName}
            </div>
            <div className="text-[11px] text-zinc-500 truncate">
              {user.phone} · {user.region}
            </div>
            <div className="text-[10px] text-zinc-600 truncate">
              {user.email}
            </div>
          </div>
        </div>
      )}

      {/* Quick action: call emergency directly */}
      <a
        href={`tel:${settings.emergencyContact || "0771938039"}`}
        className="mb-4 flex items-center gap-3 rounded-2xl bg-red-500/10 ring-1 ring-red-500/40 p-3.5"
      >
        <div className="w-10 h-10 rounded-xl bg-red-500/20 ring-1 ring-red-400/40 flex items-center justify-center">
          <ShieldAlert size={18} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-red-300">
            Call Emergency Services
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">
            {settings.emergencyContact || "0771938039"} · dialed from{" "}
            {user?.phone || "your phone"}
          </div>
        </div>
        <Phone size={16} className="text-red-300" />
      </a>

      {/* Toggles */}
      <div className="rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 divide-y divide-zinc-800/80 overflow-hidden">
        <Row icon={Volume2} label="Alarm sound" hint="Play tone on danger">
          <Toggle
            checked={settings.soundOn}
            onChange={(v) => update({ soundOn: v })}
          />
        </Row>
        <Row icon={Vibrate} label="Vibration" hint="Haptic on detections">
          <Toggle
            checked={settings.vibrationOn}
            onChange={(v) => update({ vibrationOn: v })}
          />
        </Row>
        <Row icon={Moon} label="Dark mode" hint="Industrial dark theme">
          <Toggle
            checked={settings.darkMode}
            onChange={(v) => update({ darkMode: v })}
          />
        </Row>
      </div>

      {/* Sensitivity */}
      <div className="mt-4 rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 overflow-hidden">
        <Row
          icon={GaugeIcon}
          label="Sensitivity threshold"
          hint={`Alarm triggers at or above ${settings.threshold} PPM`}
        >
          <div className="text-xs font-mono tabular-nums text-emerald-400">
            {settings.threshold}
          </div>
        </Row>
        <div className="px-4 pb-4">
          <input
            type="range"
            min="100"
            max="900"
            step="10"
            value={settings.threshold}
            onChange={(e) => update({ threshold: Number(e.target.value) })}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] tracking-widest text-zinc-500 mt-1">
            <span>SENSITIVE</span>
            <span>BALANCED</span>
            <span>TOLERANT</span>
          </div>
        </div>
      </div>

      {/* Units */}
      <div className="mt-4 rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 overflow-hidden">
        <Row icon={Ruler} label="Units" hint="Reading display">
          <div className="flex bg-zinc-950 rounded-lg p-0.5 ring-1 ring-zinc-800">
            {["ppm", "lel"].map((u) => (
              <button
                key={u}
                onClick={() => update({ units: u })}
                className={
                  "px-3 py-1 text-[11px] font-bold tracking-widest rounded-md transition-colors " +
                  (settings.units === u
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400")
                }
              >
                {u === "ppm" ? "PPM" : "LEL%"}
              </button>
            ))}
          </div>
        </Row>
      </div>

      {/* Emergency contact */}
      <div className="mt-4 rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 overflow-hidden">
        <Row
          icon={Phone}
          label="Emergency contact"
          hint="Used by the call button + alarm screen"
        >
          <button
            onClick={() => update({ emergencyContact: "0771938039" })}
            className="text-[10px] tracking-widest text-emerald-400 hover:text-emerald-300"
          >
            RESET
          </button>
        </Row>
        <div className="px-4 pb-4">
          <input
            type="tel"
            value={settings.emergencyContact}
            onChange={(e) => update({ emergencyContact: e.target.value })}
            placeholder="0771938039"
            className="w-full bg-zinc-950 ring-1 ring-zinc-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-emerald-500"
          />
        </div>
      </div>

      <button
        onClick={testAlarm}
        className="mt-5 w-full rounded-2xl py-3.5 font-bold tracking-[0.3em] text-xs bg-zinc-900 ring-1 ring-zinc-800 text-zinc-200 flex items-center justify-center gap-2"
      >
        <Bell size={14} /> TEST ALARM SOUND
      </button>

      {/* Account actions */}
      {user && (
        <div className="mt-4 rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 divide-y divide-zinc-800/80 overflow-hidden">
          <button
            onClick={onSwitchAccount}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/30 flex items-center justify-center">
              <Users size={15} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Switch / add account</div>
              <div className="text-[11px] text-zinc-500">
                Sign in with another phone or email
              </div>
            </div>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/10 ring-1 ring-red-400/30 flex items-center justify-center">
              <LogOut size={15} className="text-red-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-300">Log out</div>
              <div className="text-[11px] text-zinc-500">
                You'll need to sign in again on this device
              </div>
            </div>
          </button>
        </div>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-zinc-500 text-center">
        TYRONE DETECTOR · v0.2 · Simulation mode
      </p>
    </div>
  );
}
