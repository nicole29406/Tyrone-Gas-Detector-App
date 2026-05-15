export default function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={
        "relative w-11 h-6 rounded-full transition-colors ring-1 " +
        (disabled ? "opacity-50 " : "") +
        (checked
          ? "bg-brand-600 ring-brand-400/40"
          : "bg-slate-700 ring-slate-600")
      }
    >
      <span
        className={
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform " +
          (checked ? "translate-x-5" : "")
        }
      />
    </button>
  );
}
