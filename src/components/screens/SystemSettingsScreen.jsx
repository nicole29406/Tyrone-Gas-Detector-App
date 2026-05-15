import { Ruler, Moon, Bluetooth, BluetoothConnected } from "lucide-react";
import Card from "../ui/Card";
import MenuRow from "../ui/MenuRow";
import Toggle from "../ui/Toggle";

export default function SystemSettingsScreen({
  settings,
  setSettings,
  connectedSensor,
  onOpenSensorPair,
}) {
  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const SensorIcon = connectedSensor ? BluetoothConnected : Bluetooth;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-950">
      <Card padded={false} className="divide-y divide-slate-800 overflow-hidden">
        <MenuRow
          icon={SensorIcon}
          label="Sensor pairing"
          hint={
            connectedSensor
              ? `Connected: ${connectedSensor.name}`
              : "Pair a Bluetooth gas sensor"
          }
          trailing={
            <span
              className={
                "text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-full " +
                (connectedSensor
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-slate-800 text-slate-500")
              }
            >
              {connectedSensor ? "LINKED" : "PAIR"}
            </span>
          }
          showChevron={false}
          onClick={onOpenSensorPair}
        />
        <MenuRow
          icon={Ruler}
          label="Units"
          hint="How the gas reading is displayed"
          showChevron={false}
          trailing={
            <div className="flex bg-slate-800 rounded-lg p-0.5">
              {["ppm", "lel"].map((u) => (
                <button
                  key={u}
                  onClick={() => update({ units: u })}
                  className={
                    "px-3 py-1 text-[11px] font-bold tracking-wider rounded-md transition-colors " +
                    (settings.units === u
                      ? "bg-brand-700 text-white"
                      : "text-slate-500")
                  }
                >
                  {u === "ppm" ? "PPM" : "LEL%"}
                </button>
              ))}
            </div>
          }
        />
        <MenuRow
          icon={Moon}
          label="Dark mode"
          hint="Industrial dark theme"
          showChevron={false}
          trailing={
            <Toggle
              checked={settings.darkMode}
              onChange={(v) => update({ darkMode: v })}
            />
          }
        />
      </Card>

      <p className="mt-3 text-center text-[11px] text-slate-500 px-3">
        Bluetooth sensor pairing is simulated. A production build would scan for
        real BLE devices via the Web Bluetooth API.
      </p>
    </div>
  );
}
