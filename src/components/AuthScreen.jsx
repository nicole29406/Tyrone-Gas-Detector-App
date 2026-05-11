import { useMemo, useState } from "react";
import {
  Radiation,
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
  Calendar,
  MapPin,
  Lock,
  Sparkles,
  LogIn,
  UserPlus,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  REGIONS,
  createAccount,
  loginAccount,
  loadAccounts,
  validateEmail,
  validatePhone,
  validateDob,
  validateFullName,
  validatePassword,
  passwordStrength,
  strengthLabel,
  suggestEmail,
  saveSession,
} from "../lib/auth";

const STRENGTH_COLORS = [
  "bg-zinc-800",
  "bg-red-500",
  "bg-orange-400",
  "bg-amber-400",
  "bg-lime-400",
  "bg-emerald-400",
];

function Field({ icon: Icon, error, children }) {
  return (
    <div>
      <div
        className={
          "flex items-center gap-2 bg-zinc-900 ring-1 rounded-xl px-3 " +
          (error ? "ring-red-500/60" : "ring-zinc-800 focus-within:ring-emerald-400/60")
        }
      >
        {Icon && <Icon size={15} className="text-zinc-500" />}
        {children}
      </div>
      {error && <div className="text-[11px] text-red-400 mt-1 ml-1">{error}</div>}
    </div>
  );
}

const inputCls =
  "flex-1 bg-transparent py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none";

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const accounts = useMemo(loadAccounts, []);

  return (
    <div className="min-h-screen w-full bg-black text-zinc-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full sm:max-w-[420px] bg-zinc-950 sm:rounded-[36px] ring-1 sm:ring-4 ring-zinc-800 px-5 py-6 sm:py-8 flex flex-col">
        <Brand />

        <div className="mt-6 grid grid-cols-2 gap-1 p-1 bg-zinc-900 rounded-xl ring-1 ring-zinc-800">
          <TabButton
            active={mode === "login"}
            onClick={() => setMode("login")}
            icon={LogIn}
            label="Log in"
          />
          <TabButton
            active={mode === "signup"}
            onClick={() => setMode("signup")}
            icon={UserPlus}
            label="Sign up"
          />
        </div>

        <div className="mt-5">
          {mode === "login" ? (
            <LoginForm onAuthed={onAuthed} accounts={accounts} />
          ) : (
            <SignupForm onAuthed={onAuthed} />
          )}
        </div>

        {accounts.length > 0 && mode === "login" && (
          <SavedAccounts accounts={accounts} onAuthed={onAuthed} />
        )}

        <p className="mt-6 text-center text-[10px] text-zinc-600">
          TYRONE DETECTOR · v0.2 · Demo authentication (stored locally)
        </p>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/40 flex items-center justify-center">
        <Radiation size={28} className="text-emerald-400" />
        <span className="absolute inset-0 rounded-2xl bg-emerald-400/10 animate-ping-slow" />
      </div>
      <div className="mt-3 text-[10px] tracking-[0.35em] text-emerald-400 font-semibold">
        TYRONE
      </div>
      <div className="text-xl font-extrabold tracking-[0.2em] text-zinc-100">
        DETECTOR
      </div>
      <div className="mt-1 text-[11px] text-zinc-500">
        Gas leak detection & safety
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold tracking-widest transition-colors " +
        (active
          ? "bg-emerald-500 text-black"
          : "text-zinc-400 hover:text-zinc-200")
      }
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

// ------------------------------ LOGIN ------------------------------

function LoginForm({ onAuthed }) {
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
    <form onSubmit={submit} className="space-y-3">
      <Field icon={User}>
        <input
          autoFocus
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Username, phone, or email"
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
          className="text-zinc-500 hover:text-zinc-300 pr-1"
        >
          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </Field>

      {error && (
        <div className="text-[11px] text-red-400 bg-red-500/10 ring-1 ring-red-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-emerald-500 disabled:bg-zinc-700 text-black font-bold tracking-[0.3em] text-xs py-3.5 rounded-xl ring-1 ring-emerald-300 shadow-glow-emerald active:scale-[0.99] transition-transform"
      >
        {busy ? "SIGNING IN…" : "LOG IN"}
      </button>
    </form>
  );
}

function SavedAccounts({ accounts, onAuthed }) {
  return (
    <div className="mt-6">
      <div className="text-[10px] tracking-[0.3em] text-zinc-500 mb-2">
        SAVED ACCOUNTS
      </div>
      <div className="space-y-1.5">
        {accounts.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              // Quick-switch into this account (still locked — they need to type pw on next form)
              saveSession(a.id);
              onAuthed(a);
            }}
            className="w-full flex items-center gap-3 bg-zinc-900/60 hover:bg-zinc-900 ring-1 ring-zinc-800 rounded-xl px-3 py-2.5 text-left"
          >
            <Avatar name={a.fullName} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{a.fullName}</div>
              <div className="text-[11px] text-zinc-500 truncate">
                {a.phone} · {a.region}
              </div>
            </div>
            <ChevronRight size={14} className="text-zinc-500" />
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">
        Quick-switch keeps you logged into the most recent account on this
        device.
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
      className="rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40 text-emerald-400 font-bold flex items-center justify-center"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </div>
  );
}

// ------------------------------ SIGNUP ------------------------------

function SignupForm({ onAuthed }) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    region: "Uganda",
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
    <form onSubmit={submit} className="space-y-3">
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
          placeholder="Phone number (e.g. 0771938039)"
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
            className="text-[10px] font-bold tracking-widest text-emerald-400 hover:text-emerald-300 flex items-center gap-1 pr-1"
            title="No email? Generate a demo one"
          >
            <Sparkles size={12} /> CREATE
          </button>
        </Field>
        <p className="text-[10px] text-zinc-600 mt-1 ml-1">
          No email? Tap CREATE — we'll suggest a demo address (
          <code>@tyrone-detector.app</code>). Not a real mailbox.
        </p>
      </div>

      <Field icon={Calendar} error={errors.dob}>
        <input
          type="date"
          value={form.dob}
          onChange={(e) => update({ dob: e.target.value })}
          className={inputCls + " [color-scheme:dark]"}
        />
      </Field>

      <Field icon={MapPin} error={errors.region}>
        <select
          value={form.region}
          onChange={(e) => update({ region: e.target.value })}
          className={inputCls + " appearance-none"}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r} className="bg-zinc-900">
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
            className="text-zinc-500 hover:text-zinc-300 pr-1"
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
                (i <= strength ? STRENGTH_COLORS[strength] : "bg-zinc-800")
              }
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] mt-1 text-zinc-500">
          <span>{strengthLabel(strength)}</span>
          <span>Must include A-Z, a-z, 0-9, symbol</span>
        </div>
      </div>

      {submitError && (
        <div className="text-[11px] text-red-400 bg-red-500/10 ring-1 ring-red-500/30 rounded-lg px-3 py-2">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-emerald-500 disabled:bg-zinc-700 text-black font-bold tracking-[0.3em] text-xs py-3.5 rounded-xl ring-1 ring-emerald-300 shadow-glow-emerald active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
      >
        <Plus size={14} /> {busy ? "CREATING…" : "CREATE ACCOUNT"}
      </button>
    </form>
  );
}
