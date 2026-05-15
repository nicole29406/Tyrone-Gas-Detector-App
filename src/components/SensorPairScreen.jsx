import { useEffect, useState } from "react";
import { Bluetooth, X, Wifi, CheckCircle2 } from "lucide-react";

// REAL INTEGRATION POINT:
//   Replace `fakeDevices` + the setTimeout with `navigator.bluetooth.requestDevice({...})`
//   filtering by your gas-sensor's GATT service UUID. On select, connect with
//   `device.gatt.connect()` and subscribe to a characteristic emitting PPM.
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
    <div className="absolute inset-0 z-40 flex flex-col bg-slate-50">
      <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-slate-200 bg-white">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-brand-700 font-bold">
            PAIR
          </div>
          <div className="text-base font-bold text-slate-900">
            Sensor Connection
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center"
        >
          <X size={16} className="text-slate-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-brand-300/60 animate-ping-slow" />
            <span
              className="absolute inset-3 rounded-full border border-brand-300/50 animate-ping-slow"
              style={{ animationDelay: "0.4s" }}
            />
            <span
              className="absolute inset-6 rounded-full border border-brand-300/40 animate-ping-slow"
              style={{ animationDelay: "0.8s" }}
            />
            <div className="relative w-16 h-16 rounded-full bg-brand-50 ring-2 ring-brand-300 flex items-center justify-center">
              <Bluetooth size={26} className="text-brand-700" />
            </div>
          </div>
          <div className="mt-4 text-xs tracking-[0.3em] text-brand-700 font-bold">
            {scanning ? "SCANNING" : "DEVICES FOUND"}
          </div>
          <div className="text-sm text-slate-500 mt-1">
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
                className="h-16 rounded-2xl bg-white ring-1 ring-slate-200 animate-pulse"
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
                      ? "bg-brand-50 ring-brand-300"
                      : "bg-white ring-slate-200 hover:bg-slate-50")
                  }
                >
                  <div
                    className={
                      "w-10 h-10 rounded-xl flex items-center justify-center " +
                      (isConnected
                        ? "bg-brand-100 text-brand-700"
                        : "bg-slate-100 text-slate-500")
                    }
                  >
                    <Wifi size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {d.rssi} dBm · BLE
                    </div>
                  </div>
                  {isConnected && (
                    <CheckCircle2 size={18} className="text-brand-700" />
                  )}
                </button>
              );
            })}
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-slate-500">
          Note: smartphones don't have built-in gas sensors. A production build of
          TYRONE DETECTOR would pair here with an external Bluetooth sensor (e.g.
          MQ-series module on an ESP32) over the Web Bluetooth API.
        </p>
      </div>
    </div>
  );
}
