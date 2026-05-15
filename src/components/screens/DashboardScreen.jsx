import {
  ShieldCheck,
  Wifi,
  Clock,
  Thermometer,
  BarChart3,
  BookOpen,
  MessageCircle,
  Bluetooth,
  Radar,
  BellOff,
} from "lucide-react";
import Card, { SectionTitle } from "../ui/Card";
import {
  formatReading,
  statusAccent,
  statusForReading,
  unitLabel,
} from "../../lib/simulator";

function fmtClock(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DashboardScreen({
  liveReading,
  threshold,
  units,
  temperature,
  lastUpdated,
  connectedSensor,
  alarmAcknowledged,
  onQuickAction, // (action) => void
  onPairSensor,
}) {
  const status = statusForReading(liveReading, threshold);
  const accent = statusAccent(status);
  const sensorReady = !!connectedSensor;
  const stillDanger = status === "DANGER";

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-950">
      {/* "Alarm silenced" reminder banner — shown while user has acknowledged
          a still-active gas alert. Auto-dismisses when readings hit SAFE. */}
      {alarmAcknowledged && stillDanger && (
        <div className="mb-3 rounded-2xl bg-red-500/15 ring-1 ring-red-500/40 px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
            <BellOff size={15} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-red-300">
              Alarm silenced — gas is still elevated
            </div>
            <div className="text-[11px] text-red-600/80 mt-0.5">
              The alarm will re-arm once readings return to safe.
            </div>
          </div>
        </div>
      )}

      {/* Headline card: live gas level OR "Pair sensor" CTA */}
      {sensorReady ? (
        <Card
          className={"text-center " + accent.bg + " " + accent.border}
          padded={false}
        >
          <div className="px-4 pt-5 pb-5">
            <div className="text-[10px] tracking-[0.3em] font-bold text-slate-300 mb-1">
              GAS LEVEL
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span
                className={
                  "font-mono tabular-nums text-6xl font-extrabold leading-none " +
                  accent.text
                }
              >
                {formatReading(liveReading, units)}
              </span>
              <span className="text-sm font-bold text-slate-500 tracking-widest">
                {unitLabel(units)}
              </span>
            </div>
            <div
              className={
                "mt-2 text-base font-extrabold tracking-widest " + accent.text
              }
            >
              {accent.label === "HIGH GAS ALERT" ? "DANGER" : accent.label}
            </div>
            <div className="text-[12px] text-slate-300 mt-0.5">
              {status === "SAFE"
                ? "Air is safe"
                : status === "CAUTION"
                ? "Gas level is rising"
                : status === "WARNING"
                ? "Gas level is above normal"
                : "Evacuate immediately"}
            </div>
          </div>
        </Card>
      ) : (
        <PairSensorCTA onPair={onPairSensor} />
      )}

      {/* Status grid: 2x2 */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <StatusTile
          icon={ShieldCheck}
          label="System Status"
          value="Online"
          valueClass="text-emerald-400"
          iconBg="bg-emerald-500/15"
          iconColor="text-emerald-400"
        />
        <StatusTile
          icon={Wifi}
          label="Sensor Status"
          value={sensorReady ? "Active" : "Inactive"}
          valueClass={sensorReady ? "text-brand-300" : "text-slate-500"}
          iconBg={sensorReady ? "bg-brand-500/15" : "bg-slate-800"}
          iconColor={sensorReady ? "text-brand-300" : "text-slate-500"}
        />
        <StatusTile
          icon={Clock}
          label="Last Updated"
          value={sensorReady ? fmtClock(lastUpdated) : "—"}
          valueClass="text-slate-200"
          iconBg="bg-slate-800"
          iconColor="text-slate-500"
        />
        <StatusTile
          icon={Thermometer}
          label="Temperature"
          value={sensorReady && temperature != null ? `${temperature} °C` : "—"}
          valueClass={sensorReady ? "text-orange-400" : "text-slate-500"}
          iconBg={sensorReady ? "bg-orange-500/15" : "bg-slate-800"}
          iconColor={sensorReady ? "text-orange-400" : "text-slate-500"}
        />
      </div>

      {/* Quick Actions */}
      <SectionTitle>Quick Actions</SectionTitle>
      <Card padded={false} className="overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-slate-800">
          <QuickAction
            icon={BarChart3}
            label="View History"
            onClick={() => onQuickAction("history")}
          />
          <QuickAction
            icon={BookOpen}
            label="Safety Tips"
            onClick={() => onQuickAction("tips")}
          />
          <QuickAction
            icon={MessageCircle}
            label="Chatbot"
            onClick={() => onQuickAction("chatbot")}
          />
        </div>
      </Card>

      {sensorReady && (
        <p className="mt-3 text-[10px] text-slate-500 text-center">
          Live monitoring active · connected to{" "}
          <span className="font-semibold text-slate-500">
            {connectedSensor.name}
          </span>
        </p>
      )}
    </div>
  );
}

function PairSensorCTA({ onPair }) {
  return (
    <Card padded={false} className="border-brand-200 bg-slate-900">
      <div className="px-4 pt-5 pb-5 flex flex-col items-center text-center">
        <div className="relative w-16 h-16 flex items-center justify-center mb-3">
          <span className="absolute inset-0 rounded-full bg-brand-500/25 animate-ping-slow opacity-50" />
          <div className="relative w-14 h-14 rounded-full bg-brand-500/15 ring-2 ring-brand-500/40 flex items-center justify-center">
            <Radar size={24} className="text-brand-300" />
          </div>
        </div>
        <div className="text-[10px] tracking-[0.3em] font-bold text-slate-500 mb-1">
          NO SENSOR
        </div>
        <div className="text-base font-bold text-slate-100">
          Pair a sensor to start detecting gas
        </div>
        <div className="text-[12px] text-slate-500 mt-1 px-3">
          Scanning won't begin until a Bluetooth gas sensor is connected. Your
          phone has no gas sensor built in.
        </div>
        <button
          onClick={onPair}
          className="mt-4 bg-brand-700 hover:bg-brand-800 active:bg-brand-900 text-white text-sm font-bold tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Bluetooth size={16} /> PAIR SENSOR
        </button>
      </div>
    </Card>
  );
}

function StatusTile({
  icon: Icon,
  label,
  value,
  valueClass,
  iconBg,
  iconColor,
}) {
  return (
    <Card padded={false}>
      <div className="p-3 flex items-center gap-3">
        <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + iconBg}>
          <Icon size={18} className={iconColor} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] tracking-wider text-slate-500 uppercase font-semibold">
            {label}
          </div>
          <div className={"text-sm font-bold truncate mt-0.5 " + valueClass}>
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 py-4 px-2 hover:bg-slate-800/60 active:bg-slate-800 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
        <Icon size={18} className="text-brand-300" />
      </div>
      <div className="text-[11px] font-semibold text-slate-200 text-center leading-tight">
        {label}
      </div>
    </button>
  );
}
