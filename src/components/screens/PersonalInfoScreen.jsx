import { useState } from "react";
import { Save } from "lucide-react";
import Card from "../ui/Card";
import { REGIONS, updateAccount } from "../../lib/auth";

const inputCls =
  "w-full bg-white ring-1 ring-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-brand-500";

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">
        {label}
      </div>
      {children}
    </label>
  );
}

export default function PersonalInfoScreen({ user, onUpdate }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob || "",
    region: user?.region || "Zimbabwe",
  });
  const [saved, setSaved] = useState(false);
  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!user) return;
    const next = updateAccount(user.id, form);
    onUpdate(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-50">
      <Card className="space-y-3">
        <Field label="Full name">
          <input
            value={form.fullName}
            onChange={(e) => update({ fullName: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update({ phone: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Date of birth">
          <input
            type="date"
            value={form.dob}
            onChange={(e) => update({ dob: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Region">
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
      </Card>

      <button
        onClick={handleSave}
        className="mt-4 w-full bg-brand-700 text-white rounded-2xl py-3.5 font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-brand-800 active:bg-brand-900 transition-colors"
      >
        <Save size={16} />
        {saved ? "Saved" : "Save changes"}
      </button>

      <p className="mt-3 text-center text-[11px] text-slate-500">
        Your phone number is used for SMS alerts. Region picks the country dial
        code for outgoing alert messages.
      </p>
    </div>
  );
}
