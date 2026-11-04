import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // GitHub Pages publica el repo en https://nicozapatacruz.github.io/tripapp/
  base: "/tripapp/",
  plugins: [
    // Genera el manifest y un service worker que precarga toda la app
    // (HTML, JS, CSS, fuente e íconos) para que abra sin internet.
    // "autoUpdate": al publicar una versión nueva, el teléfono la descarga
    // sola la próxima vez que abre la app con internet.
    // Los datos del usuario no pasan por aquí: viven en IndexedDB (ver app.js).
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "Journest",
        short_name: "Journest",
        description: "Itinerario del viaje: ruta, días, calendario y documentos.",
        lang: "es",
        display: "standalone",
        orientation: "portrait",
        background_color: "#F5F6F8",
        theme_color: "#F5F6F8",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // De la fuente solo se precargan latin y latin-ext (español, €, flechas).
        // Los otros subconjuntos (cirílico, etc.) se generan pero no se usan.
        globPatterns: ["**/*.{js,css,html,png}", "**/onest-latin*.woff2"],
      },
    }),
  ],
});
