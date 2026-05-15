import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Phone,
  X,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Loader2,
  CloudOff,
  Users,
} from "lucide-react";
import {
  isSmsConfigured,
  endpointHost,
  sendEmergencySmsAll,
} from "../lib/sms";

// Escalation flow:
//   1. Alarm fires AND a sensor is paired → escalation begins.
//   2. Every REPEAT_EVERY_SECONDS we fan out an SMS to the user AND any
//      additional emergency contacts.
//   3. If the user doesn't acknowledge within ESCALATION_SECONDS we auto-dial
//      the gas emergency line via a tel: link.

const GAS_EMERGENCY_LINE = "0788246984";
const ESCALATION_SECONDS = 60;
const REPEAT_EVERY_SECONDS = 15;

function StatusBadge({ status, hint }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-mono">
        <Loader2 size={10} className="animate-spin" /> sending…
      </span>
    );
  }
  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
        <CheckCircle2 size={10} /> sent
      </span>
    );
  }
  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono">
        <CheckCircle2 size={10} /> partial
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] text-red-400 font-mono"
        title={hint || ""}
      >
        <XCircle size={10} /> failed
      </span>
    );
  }
  if (status === "simulated") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
        <CloudOff size={10} /> sim
      </span>
    );
  }
  return null;
}

export default function SmsEscalation({
  active,
  user,
  additionalContacts = [],
  gas,
  ppm,
  onAcknowledge,
}) {
  const [remaining, setRemaining] = useState(ESCALATION_SECONDS);
  const [sendCount, setSendCount] = useState(0);
  const [lastStatus, setLastStatus] = useState("idle");
  const [lastError, setLastError] = useState(null);
  const [sentRatio, setSentRatio] = useState({ sent: 0, total: 0 });
  const placedCallRef = useRef(false);
  const abortRef = useRef(null);
  const userRef = useRef(user);
  const contactsRef = useRef(additionalContacts);
  const gasRef = useRef({ gas, ppm });

  useEffect(() => {
    userRef.current = user;
  }, [user]);
  useEffect(() => {
    contactsRef.current = additionalContacts;
  }, [additionalContacts]);
  useEffect(() => {
    gasRef.current = { gas, ppm };
  }, [gas, ppm]);

  const fireSms = async () => {
    if (!isSmsConfigured()) {
      setLastStatus("simulated");
      setLastError(null);
      setSendCount((c) => c + 1);
      // Track the simulated recipient count for the UI
      const total = 1 + (contactsRef.current?.length || 0);
      setSentRatio({ sent: 0, total });
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLastStatus("pending");
    setLastError(null);
    setSendCount((c) => c + 1);

    const result = await sendEmergencySmsAll({
      user: userRef.current,
      additionalContacts: contactsRef.current,
      gas: gasRef.current.gas,
      ppm: gasRef.current.ppm,
      signal: abortRef.current.signal,
    });

    setSentRatio({ sent: result.sent, total: result.total });

    if (result.sent === 0) {
      const firstFail = result.results?.find((r) => !r.ok);
      setLastStatus("failed");
      setLastError(firstFail?.hint || firstFail?.reason || result.reason);
    } else if (result.sent === result.total) {
      setLastStatus("sent");
    } else {
      setLastStatus("partial");
      const firstFail = result.results?.find((r) => !r.ok);
      setLastError(firstFail?.hint || firstFail?.reason);
    }
  };

  useEffect(() => {
    if (!active) {
      setRemaining(ESCALATION_SECONDS);
      setSendCount(0);
      setLastStatus("idle");
      setLastError(null);
      setSentRatio({ sent: 0, total: 0 });
      placedCallRef.current = false;
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    placedCallRef.current = false;
    setRemaining(ESCALATION_SECONDS);
    setSendCount(0);
    setLastStatus("idle");

    fireSms();

    const tick = setInterval(() => {
      setRemaining((r) => {
        const next = r - 1;
        if (next <= 0) {
          clearInterval(tick);
          if (!placedCallRef.current) {
            placedCallRef.current = true;
            window.location.href = `tel:${GAS_EMERGENCY_LINE}`;
          }
          return 0;
        }
        const elapsed = ESCALATION_SECONDS - next;
        if (elapsed > 0 && elapsed % REPEAT_EVERY_SECONDS === 0) {
          fireSms();
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(tick);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  const now = new Date();
  const timeLabel = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const configured = isSmsConfigured();
  const host = endpointHost();
  const totalRecipients = 1 + (additionalContacts?.length || 0);

  return (
    <div className="absolute top-3 left-3 right-3 z-[60] pointer-events-none">
      <div
        key={sendCount}
        className="pointer-events-auto bg-zinc-900/95 backdrop-blur-md ring-1 ring-red-500/50 rounded-2xl p-3.5 shadow-glow-red animate-pulse-fast"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 ring-1 ring-red-400/40 flex items-center justify-center shrink-0">
            <MessageSquare size={16} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-bold text-zinc-100 tracking-wide truncate">
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
              Evacuate immediately,{" "}
              {user?.fullName?.split(" ")[0] || "User"}. Auto-dial in{" "}
              <span className="font-mono tabular-nums font-bold">
                {remaining}s
              </span>
              .
            </div>
            <div className="flex items-center justify-between mt-2.5 gap-2">
              <div className="text-[10px] tracking-widest text-zinc-500 flex items-center gap-1.5 min-w-0">
                <AlertOctagon size={11} className="text-red-400 shrink-0" />
                <span className="truncate flex items-center gap-1">
                  SMS #{sendCount}
                  {totalRecipients > 1 && (
                    <span className="flex items-center gap-0.5 text-emerald-400 normal-case tracking-normal">
                      <Users size={10} /> {sentRatio.sent}/{sentRatio.total || totalRecipients}
                    </span>
                  )}
                </span>
                <StatusBadge status={lastStatus} hint={lastError} />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${GAS_EMERGENCY_LINE}`}
                  className="text-[10px] font-bold tracking-widest bg-red-500 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Phone size={11} /> CALL
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
        {configured
          ? `Live: ${totalRecipients} recipient${totalRecipients > 1 ? "s" : ""} · via ${host}`
          : "Simulation mode — set VITE_SMS_ENDPOINT to enable real SMS"}
      </p>
    </div>
  );
}
