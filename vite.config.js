import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves the app at /Tyrone-Gas-Detector-App/, so all URLs in the
// manifest + service worker must use that base. In `npm run dev` we keep "/"
// so localhost works normally.
export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  const base = isBuild ? "/Tyrone-Gas-Detector-App/" : "/";

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        // Service worker scope and start url must respect the Pages base path.
        // The plugin reads `base` from Vite automatically for asset URLs, but
        // start_url/scope in the manifest live below.
        includeAssets: [
          "icon.svg",
          "icon-192.png",
          "icon-512.png",
          "icon-maskable-512.png",
          "apple-touch-icon.png",
          "favicon-32.png",
        ],
        manifest: {
          name: "JKC GAS DETECTOR",
          short_name: "JKC",
          description:
            "JKC Gas Detector — live gas leak monitoring, SMS escalation, and emergency contacts.",
          theme_color: "#020617",
          background_color: "#020617",
          display: "standalone",
          orientation: "portrait",
          start_url: base,
          scope: base,
          lang: "en",
          categories: ["utilities", "lifestyle"],
          icons: [
            {
              src: "icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icon-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any",
            },
          ],
        },
        workbox: {
          // Precache the whole app shell so it works offline after first load.
          // Twilio Worker requests live on a different origin and bypass the
          // service worker by default, so SMS sends remain live.
          globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          // Enable the service worker in `npm run dev` so we can test install
          // prompts locally without doing a full build.
          enabled: false, // off by default to avoid HMR weirdness
        },
      }),
    ],
  };
});
