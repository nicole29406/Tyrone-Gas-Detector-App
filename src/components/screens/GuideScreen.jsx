import { useState } from "react";
import {
  ChevronDown,
  Wind,
  DoorOpen,
  Phone,
  ShieldCheck,
  Flame,
} from "lucide-react";

const SECTIONS = [
  {
    id: "smell",
    title: "If you smell gas",
    Icon: Flame,
    body: [
      "Do NOT switch lights, appliances, or electronics on or off — even unplugging can spark.",
      "Do NOT use phones, doorbells, or anything that could ignite.",
      "Open doors and windows immediately for ventilation.",
      "Turn off the gas supply at the main valve if it is safe to reach.",
      "Leave the building and call emergency services from a safe distance.",
    ],
  },
  {
    id: "evac",
    title: "Evacuation steps",
    Icon: DoorOpen,
    body: [
      "Alert everyone in the building calmly — do not shout.",
      "Take the nearest exit. Do not stop to collect belongings.",
      "Move at least 100 meters / 300 ft away from the building.",
      "Account for everyone before calling emergency services.",
      "Do not re-enter until certified safe by a qualified technician.",
    ],
  },
  {
    id: "vent",
    title: "Ventilation",
    Icon: Wind,
    body: [
      "Open all windows and external doors if it is safe to do so.",
      "Avoid using fans or air conditioners with electric motors.",
      "Stay upwind and outside until gas levels return to normal.",
    ],
  },
  {
    id: "prevention",
    title: "Prevention tips",
    Icon: ShieldCheck,
    body: [
      "Service gas appliances annually with a certified technician.",
      "Install gas detectors in kitchens, near boilers, and bedrooms.",
      "Check rubber hoses and clamps for cracks every few months.",
      "Always close the cylinder valve when not in use.",
    ],
  },
];

const CONTACTS = [
  { label: "Emergency Services", number: "0771938039" },
  { label: "Gas Emergency Line", number: "0788246984" },
  { label: "Local Fire Dept", number: "112" },
];

export default function GuideScreen() {
  const [open, setOpen] = useState({ smell: true });
  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-5">
      <div className="text-[10px] tracking-[0.3em] text-zinc-500 mb-1">
        SAFETY GUIDE
      </div>
      <h1 className="text-xl font-bold mb-4">Stay Safe in a Gas Emergency</h1>

      <div className="rounded-2xl bg-red-500/5 ring-1 ring-red-500/30 p-4 mb-5">
        <div className="text-[10px] tracking-[0.3em] text-red-400 mb-1">
          EMERGENCY
        </div>
        <div className="text-sm text-zinc-200 mb-3">
          Tap to call. If you are in immediate danger, evacuate first and call
          from a safe distance.
        </div>
        <div className="space-y-2">
          {CONTACTS.map((c) => (
            <a
              key={c.label}
              href={`tel:${c.number}`}
              className="flex items-center gap-3 bg-zinc-900/60 hover:bg-zinc-900 ring-1 ring-zinc-800 rounded-xl px-3 py-2.5"
            >
              <div className="w-9 h-9 rounded-lg bg-red-500/15 ring-1 ring-red-400/40 flex items-center justify-center">
                <Phone size={15} className="text-red-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-zinc-400">{c.label}</div>
                <div className="text-sm font-semibold tracking-wide">
                  {c.number}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {SECTIONS.map(({ id, title, Icon, body }) => {
          const isOpen = !!open[id];
          return (
            <div
              key={id}
              className="rounded-2xl bg-zinc-900/60 ring-1 ring-zinc-800 overflow-hidden"
            >
              <button
                onClick={() => toggle(id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/30 flex items-center justify-center">
                  <Icon size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1 font-semibold text-sm">{title}</div>
                <ChevronDown
                  size={16}
                  className={
                    "text-zinc-400 transition-transform " +
                    (isOpen ? "rotate-180" : "")
                  }
                />
              </button>
              {isOpen && (
                <ul className="px-4 pb-4 pt-1 space-y-2 text-[13px] leading-relaxed text-zinc-300">
                  {body.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
