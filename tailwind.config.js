/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      animation: {
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "spin-slow": "spin 4s linear infinite",
        "pulse-fast": "pulse 0.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      boxShadow: {
        "glow-emerald": "0 0 40px rgba(16, 185, 129, 0.45)",
        "glow-amber": "0 0 40px rgba(245, 158, 11, 0.45)",
        "glow-red": "0 0 50px rgba(239, 68, 68, 0.55)",
      },
    },
  },
  plugins: [],
};
