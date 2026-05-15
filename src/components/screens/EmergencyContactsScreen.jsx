import { Phone, ShieldAlert, Flame, Stethoscope, Plus } from "lucide-react";
import Card, { SectionTitle } from "../ui/Card";

// Defaults from the original spec — Zimbabwean numbers.
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

export default function EmergencyContactsScreen({ settings, setSettings }) {
  const userContact = settings.emergencyContact || "0771938039";

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 bg-slate-50">
      <SectionTitle>Primary Contact</SectionTitle>
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
              Used by the "Call" button on the alarm screen
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

      <SectionTitle>System Emergency Contacts</SectionTitle>
      <Card padded={false} className="divide-y divide-slate-100 overflow-hidden">
        {SYSTEM_CONTACTS.map(({ id, label, number, icon: Icon, color, bg }) => (
          <a
            key={id}
            href={`tel:${number}`}
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + bg}>
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

      <p className="mt-3 text-center text-[11px] text-slate-500 px-3">
        Tap any contact to call directly. On a phone the dialer opens
        pre-filled.
      </p>
    </div>
  );
}
