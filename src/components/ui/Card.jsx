// Standard white rounded card with subtle shadow — the workhorse container for
// every screen.

export default function Card({ className = "", padded = true, children, ...rest }) {
  return (
    <div
      {...rest}
      className={
        "bg-white rounded-2xl shadow-card border border-slate-100 " +
        (padded ? "p-4 " : "") +
        className
      }
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mt-5 mb-2 px-1">
      <h3 className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase">
        {children}
      </h3>
      {action}
    </div>
  );
}
