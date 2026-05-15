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
      colors: {
        // Brand palette derived from the mockup: navy primary, accent shades for
        // each alert severity. Plain Tailwind names still work everywhere.
        brand: {
          50: "#eff4ff",
          100: "#dde7ff",
          200: "#b8caff",
          300: "#8ea5ff",
          400: "#6480f0",
          500: "#3b5bdb",
          600: "#2b48bf",
          700: "#1e3a8a", // primary navy used throughout the mockup
          800: "#172e6e",
          900: "#0f1f4a",
        },
      },
      animation: {
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "spin-slow": "spin 4s linear infinite",
        "pulse-fast": "pulse 0.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 220ms ease-out",
        "slide-up": "slideUp 260ms ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 31, 74, 0.06), 0 1px 2px rgba(15, 31, 74, 0.04)",
        "card-lg":
          "0 10px 25px -10px rgba(15, 31, 74, 0.12), 0 4px 10px rgba(15, 31, 74, 0.06)",
        "glow-emerald": "0 0 40px rgba(16, 185, 129, 0.45)",
        "glow-amber": "0 0 40px rgba(245, 158, 11, 0.45)",
        "glow-red": "0 0 50px rgba(239, 68, 68, 0.55)",
      },
    },
  },
  plugins: [],
};
