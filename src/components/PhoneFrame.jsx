export default function PhoneFrame({ darkMode, children }) {
  return (
    <div
      className={
        (darkMode
          ? "bg-black text-zinc-100"
          : "bg-zinc-200 text-zinc-900") +
        " min-h-full w-full flex items-center justify-center sm:p-6"
      }
    >
      <div
        className={
          (darkMode
            ? "bg-zinc-950 ring-zinc-800"
            : "bg-white ring-zinc-300") +
          " relative w-full sm:max-w-[420px] sm:h-[860px] h-screen sm:rounded-[44px] overflow-hidden ring-1 sm:ring-4 flex flex-col"
        }
      >
        {children}
      </div>
    </div>
  );
}
