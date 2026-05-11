import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { STATUS, statusAccent } from "../lib/simulator";

const ICONS = {
  [STATUS.SAFE]: ShieldCheck,
  [STATUS.CAUTION]: AlertTriangle,
  [STATUS.DANGER]: AlertOctagon,
};

export default function StatusPill({ status, size = "md" }) {
  const accent = statusAccent(status);
  const Icon = ICONS[status] || ShieldCheck;
  const sizing =
    size === "lg"
      ? "px-4 py-2 text-sm gap-2"
      : "px-3 py-1.5 text-xs gap-1.5";
  return (
    <div
      className={
        accent.bg +
        " " +
        accent.text +
        " ring-1 " +
        accent.ring +
        " inline-flex items-center rounded-full font-bold uppercase tracking-widest " +
        sizing
      }
    >
      <Icon size={size === "lg" ? 16 : 13} />
      {status}
    </div>
  );
}
