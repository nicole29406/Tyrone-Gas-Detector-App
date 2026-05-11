import { MapPin, Wind, Trash2 } from "lucide-react";
import { STATUS, statusForReading, statusAccent } from "../../lib/simulator";

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LogScreen({ alertLog, threshold, clearAlertLog }) {
  const items = [...alertLog].sort((a, b) => b.datetime - a.datetime);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-zinc-500">
            ALERT LOG
          </div>
          <h1 className="text-xl font-bold">Detection History</h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearAlertLog}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 px-2 py-1 rounded-lg ring-1 ring-zinc-800"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center text-zinc-500">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 ring-1 ring-zinc-800 flex items-center justify-center mb-3">
            <Wind size={22} />
          </div>
          <div className="text-sm font-semibold text-zinc-300">All clear</div>
          <div className="text-xs mt-1 max-w-[260px]">
            No gas events logged yet. Detections above the safety threshold will
            appear here automatically.
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const status = statusForReading(item.peak, threshold);
            const accent = statusAccent(status);
            return (
              <li
                key={item.id}
                className="rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 p-3.5 flex items-center gap-3"
              >
                <div
                  className={
                    "w-1 self-stretch rounded-full " +
                    (status === STATUS.DANGER
                      ? "bg-red-500"
                      : status === STATUS.CAUTION
                      ? "bg-amber-400"
                      : "bg-emerald-400")
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">
                      {item.gas}
                    </span>
                    <span
                      className={
                        "text-[10px] font-bold tracking-widest " + accent.text
                      }
                    >
                      {status}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                    <span>{formatDate(item.datetime)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin size={10} /> {item.location}
                    </span>
                  </div>
                  {item.source && (
                    <div className="text-[10px] text-zinc-600 mt-0.5">
                      {item.source}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div
                    className={
                      "font-mono tabular-nums font-bold text-lg " + accent.text
                    }
                  >
                    {item.peak}
                  </div>
                  <div className="text-[10px] tracking-widest text-zinc-500">
                    PPM
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
