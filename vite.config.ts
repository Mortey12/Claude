import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { appConfig } from "./src/config/appConfig.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "icons/*.png"],
      manifest: {
        name: appConfig.appName,
        short_name: appConfig.shortName,
        description: appConfig.description,
        lang: "nn",
        theme_color: appConfig.themeColor,
        background_color: appConfig.backgroundColor,
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: `/${appConfig.icon192}`, sizes: "192x192", type: "image/png" },
          { src: `/${appConfig.icon512}`, sizes: "512x512", type: "image/png" },
          {
            src: `/${appConfig.iconMaskable512}`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,json}"],
        navigateFallback: "/index.html",
        runtimeCaching: [],
      },
    }),
  ],
});
