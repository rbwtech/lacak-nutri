import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["lacaknutri.svg", "robots.txt"],
      manifest: {
        name: "LacakNutri - Scanner Nutrisi & BPOM",
        short_name: "LacakNutri",
        description: "Pantau nutrisi makanan dan cek BPOM dengan AI.",
        theme_color: "#FF9966",
        background_color: "#FDFDF5",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/lacaknutri.svg",
            sizes: "192x192",
            type: "image/webp",
            purpose: "any maskable",
          },
          {
            src: "/lacaknutri.svg",
            sizes: "512x512",
            type: "image/webp",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
