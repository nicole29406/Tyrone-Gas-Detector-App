import { useMemo, useState } from "react";
import {
  Droplet,
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
  Calendar,
  MapPin,
  Lock,
  Sparkles,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  REGIONS,
  createAccount,
  loadAccounts,
  loginAccount,
  passwordStrength,
  saveSession,
  strengthLabel,
  suggestEmail,
  validateDob,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePhone,
} from "../lib/auth";

const STRENGTH_COLORS = [
  "bg-slate-200",
  "bg-red-500",
  "bg-orange-400",
  "bg-amber-400",
  "bg-lime-400",
  "bg-emerald-500",
];

const inputCls =
  "flex-1 bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none";

function Field({ icon: Icon, error, children }) {
  return (
    <div>
      <div
        className={
          "flex items-center gap-2 bg-white ring-1 rounded-xl px-3 transition-colors " +
          (error
            ? "ring-red-300"
            : "ring-slate-200 focus-within:ring-brand-500")
        }
      >
        {Icon && <Icon size={15} className="text-slate-400" />}
        {children}
      </div>
      {error && (
        <div className="text-[11px] text-red-600 mt-1 ml-1">{error}</div>
      )}
    </div>
  );
}

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const accounts = useMemo(loadAccounts, []);

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full sm:max-w-[420px] bg-white sm:rounded-[32px] ring-1 sm:ring-2 ring-slate-200 px-5 py-6 sm:py-8 flex flex-col shadow-card-lg">
        <Brand />

        {mode === "login" ? (
          <LoginForm
            onAuthed={onAuthed}
            onSwitchMode={() => setMode("signup")}
            accounts={accounts}
          />
        ) : (
          <SignupForm
            onAuthed={onAuthed}
            onSwitchMode={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-lg">
        <Droplet size={28} className="text-white" fill="currentColor" />
      </div>
      <div className="mt-3 text-base font-extrabold tracking-wide text-brand-700 leading-tight">
        GAS LEAKAGE
      </div>
      <div className="text-base font-extrabold tracking-wide text-brand-700 leading-tight">
        DETECTION SYSTEM
      </div>
      <div className="mt-1 text-[12px] text-slate-500">Sign in to continue</div>
    </div>
  );
}

// ---------------- LOGIN ----------------

function LoginForm({ onAuthed, onSwitchMode, accounts }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) return setError("Enter username / phone / email");
    if (!password) return setError("Enter your password");
    setBusy(true);
    try {
      const acc = await loginAccount(identifier, password);
      onAuthed(acc);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <Field icon={Mail}>
        <input
          autoFocus
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email / Username"
          className={inputCls}
        />
      </Field>

      <Field icon={Lock}>
        <input
          type={showPw ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setShowPw((s) => !s)}
          className="text-slate-400 hover:text-slate-600 pr-1"
        >
          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </Field>

      <div className="flex justify-end -mt-1">
        <button
          type="button"
          className="text-[12px] text-brand-700 hover:text-brand-800 font-semibold"
          onClick={() =>
            setError(
              "Password reset is not yet wired up in this demo. Use 'Switch / add account' from Profile to re-create an account."
            )
          }
        >
          Forgot Password?
        </button>
      </div>

      {error && (
        <div className="text-[11px] text-red-600 bg-red-50 ring-1 ring-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-brand-700 disabled:bg-slate-300 text-white font-bold tracking-wider text-sm py-3.5 rounded-xl hover:bg-brand-800 active:bg-brand-900 transition-colors"
      >
        {busy ? "SIGNING IN…" : "LOGIN"}
      </button>

      <div className="text-center text-[12px] text-slate-500 pt-2">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-brand-700 font-bold hover:text-brand-800"
        >
          Register
        </button>
      </div>

      {accounts.length > 0 && (
        <SavedAccounts accounts={accounts} onAuthed={onAuthed} />
      )}
    </form>
  );
}

function SavedAccounts({ accounts, onAuthed }) {
  return (
    <div className="mt-6 pt-4 border-t border-slate-100">
      <div className="text-[10px] tracking-[0.3em] text-slate-500 font-bold mb-2">
        SAVED ACCOUNTS
      </div>
      <div className="space-y-1.5">
        {accounts.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => {
              saveSession(a.id);
              onAuthed(a);
            }}
            className="w-full flex items-center gap-3 bg-slate-50 hover:bg-slate-100 ring-1 ring-slate-200 rounded-xl px-3 py-2 text-left"
          >
            <Avatar name={a.fullName} size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {a.fullName}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {a.phone} · {a.region}
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-400 text-center">
        Quick-switch keeps you signed in on this device.
      </p>
    </div>
  );
}

export function Avatar({ name, size = 36 }) {
  const initials = (name || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </div>
  );
}

// ---------------- SIGNUP ----------------

function SignupForm({ onAuthed, onSwitchMode }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    region: "Zimbabwe",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const strength = passwordStrength(form.password);

  const validate = () => {
    const e = {};
    e.fullName = validateFullName(form.fullName);
    e.phone = validatePhone(form.phone);
    e.email = validateEmail(form.email);
    e.dob = validateDob(form.dob);
    e.password = validatePassword(form.password);
    if (!form.region) e.region = "Choose a region";
    Object.keys(e).forEach((k) => e[k] == null && delete e[k]);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setBusy(true);
    try {
      const acc = await createAccount(form);
      onAuthed(acc);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <Field icon={User} error={errors.fullName}>
        <input
          value={form.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          placeholder="Full name"
          className={inputCls}
        />
      </Field>

      <Field icon={Phone} error={errors.phone}>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="Phone (e.g. 0771938039)"
          className={inputCls}
        />
      </Field>

      <div>
        <Field icon={Mail} error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="Email address"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => update({ email: suggestEmail(form.fullName) })}
            className="text-[10px] font-bold tracking-wider text-brand-700 hover:text-brand-800 flex items-center gap-1 pr-1"
            title="No email? Generate a demo one"
          >
            <Sparkles size={12} /> CREATE
          </button>
        </Field>
        <p className="text-[10px] text-slate-500 mt-1 ml-1">
          No email? Tap <b>CREATE</b> for a demo address.
        </p>
      </div>

      <Field icon={Calendar} error={errors.dob}>
        <input
          type="date"
          value={form.dob}
          onChange={(e) => update({ dob: e.target.value })}
          className={inputCls}
        />
      </Field>

      <Field icon={MapPin} error={errors.region}>
        <select
          value={form.region}
          onChange={(e) => update({ region: e.target.value })}
          className={inputCls + " appearance-none"}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <div>
        <Field icon={Lock} error={errors.password}>
          <input
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={(e) => update({ password: e.target.value })}
            placeholder="Password (8+ chars, mixed)"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="text-slate-400 hover:text-slate-600 pr-1"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </Field>
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
        <div className="flex justify-between text-[10px] mt-1 text-slate-500">
          <span>{strengthLabel(strength)}</span>
          <span>A-Z · a-z · 0-9 · symbol</span>
        </div>
      </div>

      {submitError && (
        <div className="text-[11px] text-red-600 bg-red-50 ring-1 ring-red-200 rounded-lg px-3 py-2">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-brand-700 disabled:bg-slate-300 text-white font-bold tracking-wider text-sm py-3.5 rounded-xl hover:bg-brand-800 active:bg-brand-900 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={14} /> {busy ? "CREATING…" : "CREATE ACCOUNT"}
      </button>

      <div className="text-center text-[12px] text-slate-500 pt-2">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-brand-700 font-bold hover:text-brand-800"
        >
          Sign in
        </button>
      </div>
    </form>
  );
}
