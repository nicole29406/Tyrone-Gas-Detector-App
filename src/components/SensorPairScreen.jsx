import { useEffect, useState } from "react";
import { Bluetooth, X, Wifi, CheckCircle2 } from "lucide-react";

// Simulated Bluetooth device list.
// REAL INTEGRATION POINT:
//   Replace `fakeDevices` + the `setTimeout` scan with `navigator.bluetooth.requestDevice({...})`
//   filtering by your gas-sensor's GATT service UUID. On select, connect with
//   `device.gatt.connect()` and subscribe to a characteristic that emits PPM readings.
const fakeDevices = [
  { id: "mq2-a1b2", name: "MQ-2 Sensor #A1B2", rssi: -42 },
  { id: "esp32-gas-lab", name: "ESP32-Gas-Lab", rssi: -56 },
  { id: "tyrone-probe-01", name: "TYRONE-Probe-01", rssi: -71 },
];

export default function SensorPairScreen({
  open,
  onClose,
  connectedSensor,
  onConnect,
  darkMode,
}) {
  const [scanning, setScanning] = useState(true);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (!open) return;
    setScanning(true);
    setDevices([]);
    const t = setTimeout(() => {
      setDevices(fakeDevices);
      setScanning(false);
    }, 1800);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={
        (darkMode ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900") +
        " absolute inset-0 z-40 flex flex-col"
      }
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-zinc-900">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-emerald-400">PAIR</div>
          <div className="text-lg font-bold tracking-wide">Sensor Connection</div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-zinc-900 ring-1 ring-zinc-800 flex items-center justify-center"
        >
          <X size={16} className="text-zinc-300" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping-slow" />
            <span
              className="absolute inset-3 rounded-full border border-emerald-400/30 animate-ping-slow"
              style={{ animationDelay: "0.4s" }}
            />
            <span
              className="absolute inset-6 rounded-full border border-emerald-400/20 animate-ping-slow"
              style={{ animationDelay: "0.8s" }}
            />
            <div className="relative w-16 h-16 rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/50 flex items-center justify-center">
              <Bluetooth size={26} className="text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 text-xs tracking-[0.3em] text-emerald-400">
            {scanning ? "SCANNING" : "DEVICES FOUND"}
          </div>
          <div className="text-sm text-zinc-400 mt-1">
            {scanning
              ? "Looking for nearby Bluetooth gas sensors…"
              : "Tap a device to pair"}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {scanning &&
            [0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 animate-pulse"
              />
            ))}

          {!scanning &&
            devices.map((d) => {
              const isConnected = connectedSensor?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onConnect(d)}
                  className={
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl ring-1 text-left transition-colors " +
                    (isConnected
                      ? "bg-emerald-500/10 ring-emerald-400/50"
                      : "bg-zinc-900/60 ring-zinc-800 hover:bg-zinc-900")
                  }
                >
                  <div
                    className={
                      "w-10 h-10 rounded-xl flex items-center justify-center " +
                      (isConnected
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-800 text-zinc-300")
                    }
                  >
                    <Wifi size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{d.name}</div>
                    <div className="text-[11px] text-zinc-500">
                      {d.rssi} dBm · BLE
                    </div>
                  </div>
                  {isConnected && (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  )}
                </button>
              );
            })}
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-zinc-500">
          Note: smartphones don't have built-in gas sensors. A production build of
          TYRONE DETECTOR would pair here with an external Bluetooth sensor (e.g.
          MQ-series module on an ESP32) over the Web Bluetooth API.
        </p>
      </div>
    </div>
  );
}
