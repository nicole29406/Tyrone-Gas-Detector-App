import { Wind, MapPin, Trash2 } from "lucide-react";
import Card from "../ui/Card";
import { STATUS, statusAccent, statusForReading } from "../../lib/simulator";

function fmtDate(ts) {
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryScreen({ alertLog, threshold, clearAlertLog }) {
  const items = [...alertLog].sort((a, b) => b.datetime - a.datetime);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-950">
      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center mt-16">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-3">
            <Wind size={22} className="text-emerald-400" />
          </div>
          <div className="text-sm font-semibold text-slate-200">All clear</div>
          <div className="text-[12px] text-slate-500 mt-1 max-w-[260px]">
            No gas events logged yet. Detections above the safety threshold will
            appear here automatically.
          </div>
        </div>
      ) : (
        <Card padded={false} className="divide-y divide-slate-800 overflow-hidden">
          {items.map((item) => {
            const status =
              item.status || statusForReading(item.peak ?? 0, threshold);
            const accent = statusAccent(status);
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className={"w-1 self-stretch rounded-full " + accent.text.replace("text-", "bg-")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-100 truncate">
                      {item.gas || "Unknown gas"}
                    </span>
                    <span className={"text-[10px] font-bold tracking-widest " + accent.text}>
                      {accent.label === "HIGH GAS ALERT" ? "DANGER" : accent.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{fmtDate(item.datetime)}</span>
                    {item.location && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin size={10} /> {item.location}
                        </span>
                      </>
                    )}
                  </div>
                  {item.source && (
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.source}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className={"font-mono tabular-nums font-bold text-lg " + accent.text}>
                    {item.peak ?? "—"}
                  </div>
                  <div className="text-[10px] tracking-widest text-slate-500 font-semibold">
                    PPM
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {items.length > 0 && (
        <button
          onClick={clearAlertLog}
          className="mt-4 mx-auto flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-red-400 px-3 py-1.5"
        >
          <Trash2 size={12} /> Clear history
        </button>
      )}
    </div>
  );
}
