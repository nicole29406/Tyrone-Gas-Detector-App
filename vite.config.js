import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// When deployed to GitHub Pages the app lives at
// https://nicole29406.github.io/Tyrone-Gas-Detector-App/, so all asset URLs
// need that prefix. In `npm run dev` we keep `/` so localhost works normally.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/Tyrone-Gas-Detector-App/" : "/",
}));
