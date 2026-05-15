import { AlertTriangle, AlertOctagon, AlertCircle, Info, Trash2 } from "lucide-react";
import Card from "../ui/Card";
import { STATUS, statusAccent } from "../../lib/simulator";

const ICON_FOR_STATUS = {
  [STATUS.DANGER]: AlertOctagon,
  [STATUS.WARNING]: AlertTriangle,
  [STATUS.CAUTION]: AlertCircle,
  [STATUS.INFO]: Info,
  [STATUS.SAFE]: Info,
};

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function classifySeverity(item) {
  // History entries store a `peak` PPM; derive severity from it if not present
  if (item.status) return item.status;
  if (item.source === "System check") return STATUS.INFO;
  if (item.peak >= 200) return STATUS.DANGER;
  if (item.peak >= 100) return STATUS.WARNING;
  if (item.peak >= 50) return STATUS.CAUTION;
  return STATUS.INFO;
}

export default function AlertsScreen({ alertLog, clearAlertLog }) {
  // Newest first; if empty, still show the "system check" info as a placeholder.
  const items = [...alertLog].sort((a, b) => b.datetime - a.datetime);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-950">
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <AlertCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <button
          onClick={clearAlertLog}
          className="mt-4 mx-auto flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-red-400 px-3 py-1.5"
        >
          <Trash2 size={12} /> Clear all alerts
        </button>
      )}
    </div>
  );
}

function AlertCard({ item }) {
  const severity = classifySeverity(item);
  const accent = statusAccent(severity);
  const Icon = ICON_FOR_STATUS[severity] || Info;
  return (
    <Card padded={false} className={"border " + accent.border}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div
          className={
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " +
            accent.bg
          }
        >
          <Icon size={20} className={accent.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className={"text-[12px] font-bold tracking-wide " + accent.text}>
              {accent.label}
            </div>
            <div className="text-[10px] text-slate-500 tabular-nums">
              {fmtTime(item.datetime)}
            </div>
          </div>
          <div className="text-[13px] text-slate-200 mt-0.5 leading-snug">
            {item.message || accent.subtitle}
          </div>
          {(item.peak != null || item.gas) && (
            <div className="text-[11px] text-slate-500 mt-1">
              {item.peak != null && (
                <>
                  Level:{" "}
                  <span className={"font-bold " + accent.text}>{item.peak} PPM</span>
                </>
              )}
              {item.gas && <> · {item.gas}</>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-16">
      <div className="w-14 h-14 rounded-2xl bg-blue-500/15 flex items-center justify-center mb-3">
        <Info size={22} className="text-blue-400" />
      </div>
      <div className="text-sm font-semibold text-slate-200">No alerts yet</div>
      <div className="text-[12px] text-slate-500 mt-1 max-w-[280px]">
        Alerts appear here automatically when gas readings cross the threshold or
        the system records an event.
      </div>
    </div>
  );
}
