import { useState } from "react";
import {
  Phone,
  ShieldAlert,
  Flame,
  Stethoscope,
  Plus,
  Trash2,
  User,
  X,
  Check,
  Users,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card, { SectionTitle } from "../ui/Card";
import { REGIONS, validatePhone } from "../../lib/auth";
import { sendTestSms, isSmsConfigured } from "../../lib/sms";

// Fixed system contacts (always shown, can't be deleted)
const SYSTEM_CONTACTS = [
  {
    id: "emergency",
    label: "Emergency Services",
    number: "0771938039",
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    id: "gas",
    label: "Gas Emergency Line",
    number: "0788246984",
    icon: Flame,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    id: "fire",
    label: "Local Fire Department",
    number: "112",
    icon: Stethoscope,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const inputCls =
  "w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-brand-500";

export default function EmergencyContactsScreen({
  settings,
  setSettings,
  user,
}) {
  const userContact = settings.emergencyContact || "0771938039";
  const additional = settings.additionalContacts || [];

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    region: user?.region || "Zimbabwe",
  });
  const [draftError, setDraftError] = useState(null);

  // Per-recipient test-SMS status. Keyed by id ("self" for the user, or the
  // contact's id). Value is { busy, result } where result is the response.
  const [testStatus, setTestStatus] = useState({});

  const runTest = async (id, phone, region, name) => {
    setTestStatus((s) => ({ ...s, [id]: { busy: true } }));
    const result = await sendTestSms({ to: phone, region, name });
    setTestStatus((s) => ({ ...s, [id]: { busy: false, result } }));
    // Auto-clear after 20s so the badge doesn't linger forever
    setTimeout(() => {
      setTestStatus((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }, 20000);
  };

  const addContact = () => {
    setDraftError(null);
    if (!draft.name.trim()) {
      setDraftError("Name is required");
      return;
    }
    const phoneErr = validatePhone(draft.phone);
    if (phoneErr) {
      setDraftError(phoneErr);
      return;
    }
    const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setSettings((s) => ({
      ...s,
      additionalContacts: [
        ...(s.additionalContacts || []),
        {
          id,
          name: draft.name.trim(),
          phone: draft.phone.trim(),
          region: draft.region,
        },
      ],
    }));
    setDraft({ name: "", phone: "", region: user?.region || "Zimbabwe" });
    setAdding(false);
  };

  const removeContact = (id) => {
    setSettings((s) => ({
      ...s,
      additionalContacts: (s.additionalContacts || []).filter(
        (c) => c.id !== id
      ),
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-50">
      <SectionTitle>Primary Contact (auto-dial)</SectionTitle>
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Phone size={18} className="text-brand-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900">
              Auto-dial number
            </div>
            <div className="text-[11px] text-slate-500">
              Dialed by the "Call" button on the alarm screen
            </div>
          </div>
          <a
            href={`tel:${userContact}`}
            className="bg-brand-700 text-white text-[11px] font-bold tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1"
          >
            <Phone size={11} /> CALL
          </a>
        </div>
        <input
          type="tel"
          value={settings.emergencyContact}
          onChange={(e) =>
            setSettings((s) => ({ ...s, emergencyContact: e.target.value }))
          }
          placeholder="0771938039"
          className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-brand-500"
        />
      </Card>

      {/* SMS recipients */}
      <SectionTitle
        action={
          !adding && (
            <button
              onClick={() => setAdding(true)}
              className="text-[11px] font-bold tracking-wider text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              <Plus size={12} /> ADD
            </button>
          )
        }
      >
        SMS Recipients ({additional.length})
      </SectionTitle>

      <Card padded={false} className="overflow-hidden">
        {/* The account's own number — always a recipient */}
        <div className="px-4 py-3 bg-brand-50/40 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <User size={16} className="text-brand-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                You ({user?.fullName || "—"})
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {user?.phone || "—"}
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-wider text-brand-700 bg-brand-100 rounded-full px-2 py-0.5">
              ALWAYS
            </span>
          </div>
          {isSmsConfigured() && user?.phone && (
            <TestButton
              status={testStatus["self"]}
              onClick={() => runTest("self", user.phone, user.region, user.fullName)}
            />
          )}
        </div>

        {additional.length === 0 && !adding && (
          <div className="px-4 py-6 text-center text-[12px] text-slate-500">
            No extra recipients yet. Add family or friends to notify them
            automatically when an alarm fires.
          </div>
        )}

        {additional.map((c) => (
          <div key={c.id} className="px-4 py-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Users size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {c.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {c.phone} · {c.region}
                </div>
              </div>
              <a
                href={`tel:${c.phone}`}
                className="text-slate-500 hover:text-brand-700 p-1.5"
                aria-label="Call"
              >
                <Phone size={14} />
              </a>
              <button
                onClick={() => removeContact(c.id)}
                className="text-slate-400 hover:text-red-600 p-1.5"
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {isSmsConfigured() && (
              <TestButton
                status={testStatus[c.id]}
                onClick={() => runTest(c.id, c.phone, c.region, c.name)}
              />
            )}
          </div>
        ))}

        {adding && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
            <input
              autoFocus
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Name (e.g. Mum)"
              className={inputCls}
            />
            <input
              type="tel"
              value={draft.phone}
              onChange={(e) =>
                setDraft((d) => ({ ...d, phone: e.target.value }))
              }
              placeholder="Phone (e.g. 0771234567)"
              className={inputCls + " font-mono tabular-nums"}
            />
            <select
              value={draft.region}
              onChange={(e) =>
                setDraft((d) => ({ ...d, region: e.target.value }))
              }
              className={inputCls + " appearance-none"}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {draftError && (
              <div className="text-[11px] text-red-600 bg-red-50 ring-1 ring-red-200 rounded-lg px-3 py-1.5">
                {draftError}
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={addContact}
                className="flex-1 bg-brand-700 hover:bg-brand-800 text-white text-[12px] font-bold tracking-wide py-2 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> ADD CONTACT
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setDraftError(null);
                  setDraft({
                    name: "",
                    phone: "",
                    region: user?.region || "Zimbabwe",
                  });
                }}
                className="px-3 py-2 text-[12px] font-bold tracking-wide text-slate-600 hover:text-slate-900"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </Card>

      <p className="mt-2 text-[11px] text-slate-500 px-1">
        All recipients listed here receive an SMS when the alarm fires.
        <br />
        <span className="text-amber-700">
          Twilio trial accounts can only send to verified numbers — verify each
          contact at console.twilio.com first.
        </span>
      </p>

      {!isSmsConfigured() && (
        <p className="mt-2 text-[11px] text-slate-500 px-1 italic">
          SMS endpoint not configured — Test SMS unavailable.
        </p>
      )}

      <SectionTitle>System Emergency Contacts</SectionTitle>
      <Card padded={false} className="divide-y divide-slate-100 overflow-hidden">
        {SYSTEM_CONTACTS.map(({ id, label, number, icon: Icon, color, bg }) => (
          <a
            key={id}
            href={`tel:${number}`}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div
              className={
                "w-10 h-10 rounded-xl flex items-center justify-center " + bg
              }
            >
              <Icon size={18} className={color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {label}
              </div>
              <div className="text-[12px] text-slate-500 font-mono tabular-nums">
                {number}
              </div>
            </div>
            <Phone size={14} className="text-slate-400" />
          </a>
        ))}
      </Card>
    </div>
  );
}

// Test-SMS button + status feedback shown beneath each recipient row.
function TestButton({ status, onClick }) {
  if (status?.busy) {
    return (
      <div className="mt-2 ml-12 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Loader2 size={11} className="animate-spin" /> Sending test SMS…
      </div>
    );
  }
  if (status?.result?.ok) {
    return (
      <div className="mt-2 ml-12 flex items-start gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 rounded-lg px-2 py-1.5">
        <CheckCircle2 size={11} className="mt-0.5 shrink-0" />
        <span>
          Sent! Twilio status:{" "}
          <span className="font-mono">{status.result.twilioStatus}</span>. Check
          your phone's Messages app.
        </span>
      </div>
    );
  }
  if (status?.result && !status.result.ok) {
    return (
      <div className="mt-2 ml-12 flex items-start gap-1.5 text-[11px] text-red-700 bg-red-50 ring-1 ring-red-200 rounded-lg px-2 py-1.5">
        <XCircle size={11} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold">
            Failed{status.result.code ? ` (${status.result.code})` : ""}
          </div>
          <div className="break-words">{status.result.reason}</div>
          {status.result.hint && (
            <div className="mt-1 text-red-600/80">{status.result.hint}</div>
          )}
        </div>
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className="mt-2 ml-12 flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 hover:text-brand-800"
    >
      <Send size={11} /> Test SMS
    </button>
  );
}
