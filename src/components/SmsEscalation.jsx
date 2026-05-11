import { useEffect, useRef, useState } from "react";
import { MessageSquare, Phone, X, AlertOctagon } from "lucide-react";

// Simulated SMS-style notification popup that appears repeatedly during a 60s
// escalation window. The user can acknowledge to cancel; if they don't, after
// 60s we auto-dial the gas emergency line via a `tel:` link.
//
// REAL INTEGRATION:
//   A production build would call your backend (which uses Twilio / Africa's
//   Talking / similar) to actually send an SMS to the user's phone. The
//   browser cannot send SMS on its own.

const GAS_EMERGENCY_LINE = "0788246984";
const ESCALATION_SECONDS = 60;
const REPEAT_EVERY_SECONDS = 10; // how often the toast "buzzes" again

export default function SmsEscalation({
  active,
  user,
  gas,
  ppm,
  onAcknowledge,
}) {
  const [remaining, setRemaining] = useState(ESCALATION_SECONDS);
  const [pulseKey, setPulseKey] = useState(0); // bump to trigger re-pulse
  const placedCallRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setRemaining(ESCALATION_SECONDS);
      setPulseKey(0);
      placedCallRef.current = false;
      return;
    }

    placedCallRef.current = false;
    setRemaining(ESCALATION_SECONDS);
    setPulseKey((k) => k + 1);

    const tick = setInterval(() => {
      setRemaining((r) => {
        const next = r - 1;
        if (next <= 0) {
          clearInterval(tick);
          // Auto-call the gas emergency line via tel: link.
          if (!placedCallRef.current) {
            placedCallRef.current = true;
            window.location.href = `tel:${GAS_EMERGENCY_LINE}`;
          }
          return 0;
        }
        // Re-pulse the toast every REPEAT_EVERY_SECONDS
        if ((ESCALATION_SECONDS - next) % REPEAT_EVERY_SECONDS === 0) {
          setPulseKey((k) => k + 1);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [active]);

  if (!active) return null;

  const sendCount = Math.floor((ESCALATION_SECONDS - remaining) / REPEAT_EVERY_SECONDS) + 1;
  const now = new Date();
  const timeLabel = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="absolute top-3 left-3 right-3 z-[60] pointer-events-none">
      <div
        key={pulseKey}
        className="pointer-events-auto bg-zinc-900/95 backdrop-blur-md ring-1 ring-red-500/50 rounded-2xl p-3.5 shadow-glow-red animate-pulse-fast"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 ring-1 ring-red-400/40 flex items-center justify-center shrink-0">
            <MessageSquare size={16} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold text-zinc-100 tracking-wide">
                Gas Emergency Line · {GAS_EMERGENCY_LINE}
              </div>
              <div className="text-[10px] text-zinc-500">{timeLabel}</div>
            </div>
            <div className="text-[12px] text-zinc-200 mt-1 leading-snug">
              <span className="font-bold text-red-400">ALERT</span>: Gas leak
              detected at your registered address.
              {gas && (
                <>
                  {" "}
                  Reading <span className="font-mono">{ppm} PPM</span> ({gas}).
                </>
              )}{" "}
              Evacuate immediately. {user?.fullName?.split(" ")[0] || "User"},
              tap acknowledge or we will dial the line in{" "}
              <span className="font-mono tabular-nums font-bold">
                {remaining}s
              </span>
              .
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <div className="text-[10px] tracking-widest text-zinc-500 flex items-center gap-1">
                <AlertOctagon size={11} className="text-red-400" />
                AUTO-SMS #{sendCount} · to{" "}
                <span className="font-mono">{user?.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${GAS_EMERGENCY_LINE}`}
                  className="text-[10px] font-bold tracking-widest bg-red-500 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Phone size={11} /> CALL NOW
                </a>
                <button
                  onClick={onAcknowledge}
                  className="text-[10px] font-bold tracking-widest bg-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <X size={11} /> ACK
                </button>
              </div>
            </div>

            {/* Countdown bar */}
            <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(remaining / ESCALATION_SECONDS) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-center text-[9px] text-zinc-600 px-3">
        Demo: real deployment would send a true SMS via Twilio/Africa's Talking.
      </p>
    </div>
  );
}
