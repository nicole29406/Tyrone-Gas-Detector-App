import { useEffect, useRef, useState } from "react";
import { Zap, MapPin, Clock } from "lucide-react";
import Gauge from "../Gauge";
import StatusPill from "../StatusPill";
import {
  STATUS,
  randomScanPpm,
  randomGas,
  statusForReading,
} from "../../lib/simulator";
import { unlockAudio } from "../../lib/audio";

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DetectorScreen({
  lastScan,
  setLastScan,
  threshold,
  units,
  vibrationOn,
  appendAlertLog,
  connectedSensor,
}) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const runScan = () => {
    if (scanning) return;
    unlockAudio();
    if (vibrationOn && navigator.vibrate) navigator.vibrate(20);

    setScanning(true);
    setProgress(0);

    const total = 5000;
    const tick = 100;
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += tick;
      setProgress(Math.min(1, elapsed / total));
      if (elapsed >= total) {
        clearInterval(timerRef.current);
        const ppm = randomScanPpm();
        const gas = randomGas();
        const status = statusForReading(ppm, threshold);
        const timestamp = Date.now();
        setLastScan({ ppm, gas, status, timestamp });
        if (status !== STATUS.SAFE) {
          appendAlertLog({
            id: timestamp,
            datetime: timestamp,
            gas,
            peak: ppm,
            location: "Kitchen — Home",
            source: "Manual scan",
          });
        }
        if (vibrationOn && navigator.vibrate)
          navigator.vibrate(status === STATUS.DANGER ? [60, 40, 60] : 40);
        setScanning(false);
      }
    }, tick);
  };

  const displayPpm = scanning ? 0 : lastScan?.ppm ?? 0;
  const displayStatus = scanning
    ? STATUS.SAFE
    : lastScan?.status ?? STATUS.SAFE;

  return (
    <div className="flex-1 flex flex-col px-5 pt-3 pb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] tracking-[0.3em] text-zinc-500">
          DETECTOR
        </div>
        <div
          className={
            "text-[10px] tracking-widest " +
            (connectedSensor ? "text-emerald-400" : "text-zinc-500")
          }
        >
          {connectedSensor
            ? `LINKED · ${connectedSensor.name}`
            : "SIMULATED SENSOR"}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <Gauge
          ppm={displayPpm}
          status={displayStatus}
          units={units}
          scanning={scanning}
        />

        <div className="mt-6">
          {scanning ? (
            <div className="text-xs tracking-[0.3em] text-emerald-400 animate-pulse">
              SCANNING · {Math.round(progress * 100)}%
            </div>
          ) : lastScan ? (
            <div className="flex flex-col items-center gap-3">
              <StatusPill status={lastScan.status} size="lg" />
              <div className="flex items-center gap-4 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Zap size={12} className="text-emerald-400" />
                  {lastScan.gas}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-zinc-500" />
                  {formatTime(lastScan.timestamp)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-zinc-500" />
                  Kitchen
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs tracking-[0.3em] text-zinc-500">
              READY — TAP SCAN TO BEGIN
            </div>
          )}
        </div>
      </div>

      <button
        onClick={runScan}
        disabled={scanning}
        className={
          "mt-4 w-full rounded-2xl py-5 font-extrabold tracking-[0.35em] text-sm transition-all " +
          (scanning
            ? "bg-zinc-900 text-zinc-500 ring-1 ring-zinc-800"
            : "bg-emerald-500 text-black ring-1 ring-emerald-300 shadow-glow-emerald active:scale-[0.98]")
        }
      >
        {scanning ? "SCANNING…" : "SCAN"}
      </button>
    </div>
  );
}
