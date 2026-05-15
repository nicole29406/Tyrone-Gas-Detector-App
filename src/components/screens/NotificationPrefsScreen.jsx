import { Volume2, Vibrate, Bell, Gauge as GaugeIcon } from "lucide-react";
import Card from "../ui/Card";
import MenuRow from "../ui/MenuRow";
import Toggle from "../ui/Toggle";
import { playTestBeep, unlockAudio } from "../../lib/audio";

export default function NotificationPrefsScreen({ settings, setSettings }) {
  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const testAlarm = () => {
    unlockAudio();
    playTestBeep();
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-50">
      <Card padded={false} className="divide-y divide-slate-100 overflow-hidden">
        <MenuRow
          icon={Volume2}
          label="Alarm sound"
          hint="Play tone on danger"
          showChevron={false}
          trailing={
            <Toggle
              checked={settings.soundOn}
              onChange={(v) => update({ soundOn: v })}
            />
          }
        />
        <MenuRow
          icon={Vibrate}
          label="Vibration"
          hint="Haptic on detections"
          showChevron={false}
          trailing={
            <Toggle
              checked={settings.vibrationOn}
              onChange={(v) => update({ vibrationOn: v })}
            />
          }
        />
      </Card>

      <Card className="mt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
            <GaugeIcon size={17} className="text-brand-700" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">
              Sensitivity threshold
            </div>
            <div className="text-[11px] text-slate-500">
              Alarm triggers at or above{" "}
              <span className="font-bold text-brand-700">
                {settings.threshold} PPM
              </span>
            </div>
          </div>
        </div>
        <input
          type="range"
          min="100"
          max="900"
          step="10"
          value={settings.threshold}
          onChange={(e) => update({ threshold: Number(e.target.value) })}
          className="w-full accent-brand-700"
        />
        <div className="flex justify-between text-[10px] tracking-widest text-slate-500 mt-1 font-semibold">
          <span>SENSITIVE</span>
          <span>BALANCED</span>
          <span>TOLERANT</span>
        </div>
      </Card>

      <button
        onClick={testAlarm}
        className="mt-4 w-full bg-white border border-slate-200 rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Bell size={16} /> Test alarm sound
      </button>
    </div>
  );
}
