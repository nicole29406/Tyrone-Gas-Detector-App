import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Card, { SectionTitle } from "../ui/Card";
import {
  hashPassword,
  loadAccounts,
  passwordStrength,
  saveAccounts,
  strengthLabel,
  validatePassword,
} from "../../lib/auth";

const STRENGTH_COLORS = [
  "bg-slate-200",
  "bg-red-500",
  "bg-orange-400",
  "bg-amber-400",
  "bg-lime-400",
  "bg-emerald-500",
];

const inputCls =
  "w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-brand-500";

export default function SecurityScreen({ user, onUpdate }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok'|'err', message }
  const [busy, setBusy] = useState(false);

  const strength = passwordStrength(next);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!current || !next) {
      setStatus({ type: "err", message: "Both fields are required" });
      return;
    }
    const pwErr = validatePassword(next);
    if (pwErr) {
      setStatus({ type: "err", message: pwErr });
      return;
    }
    if (current === next) {
      setStatus({ type: "err", message: "New password must differ from current" });
      return;
    }

    setBusy(true);
    try {
      const accounts = loadAccounts();
      const fresh = accounts.find((a) => a.id === user.id);
      if (!fresh) throw new Error("Account not found");
      const currentHash = await hashPassword(current, fresh.salt);
      if (currentHash !== fresh.passwordHash) {
        setStatus({ type: "err", message: "Current password is incorrect" });
        return;
      }
      const newHash = await hashPassword(next, fresh.salt);
      const updated = accounts.map((a) =>
        a.id === user.id ? { ...a, passwordHash: newHash } : a
      );
      saveAccounts(updated);
      onUpdate(updated.find((a) => a.id === user.id));
      setCurrent("");
      setNext("");
      setStatus({ type: "ok", message: "Password updated successfully" });
    } catch (err) {
      setStatus({ type: "err", message: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-50">
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <ShieldCheck size={18} className="text-brand-700" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Change password
            </div>
            <div className="text-[11px] text-slate-500">
              Use at least 8 characters with letters, numbers & symbols
            </div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Current password"
              className={inputCls + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute top-2.5 right-2 text-slate-400 hover:text-slate-600"
              aria-label="Toggle visibility"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div>
            <input
              type={show ? "text" : "password"}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="New password"
              className={inputCls}
            />
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={
                    "h-1 flex-1 rounded-full " +
                    (i <= strength ? STRENGTH_COLORS[strength] : "bg-slate-200")
                  }
                />
              ))}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Strength: <span className="font-bold">{strengthLabel(strength)}</span>
            </div>
          </div>

          {status && (
            <div
              className={
                "text-[11px] rounded-lg px-3 py-2 " +
                (status.type === "ok"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200")
              }
            >
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand-700 text-white rounded-2xl py-3 font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-brand-800 disabled:bg-slate-300 transition-colors"
          >
            <Lock size={14} /> {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      </Card>

      <SectionTitle>Session</SectionTitle>
      <Card>
        <div className="text-[12px] text-slate-700">
          You are signed in on this device. Logging out clears the saved session
          and returns you to the login screen.
        </div>
      </Card>
    </div>
  );
}
