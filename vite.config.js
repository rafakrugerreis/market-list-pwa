import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Workbox gera o SW automaticamente — sem sw manual
      workbox: {
        // network-first para o HTML (evita tela branca após deploy)
        navigationPreload: false,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Assets com hash do Vite: cache-first (seguro, o hash muda com o conteúdo)
            urlPattern: /\/assets\/.+\.(js|css)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "assets-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Fontes, imagens e demais estáticos
            urlPattern: /\.(?:png|svg|ico|woff2?|ttf)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      // Manifesto inline — o plugin injeta automaticamente no index.html
      manifest: {
        name: "MarketList",
        short_name: "MarketList",
        description: "PWA para lista de compras de mercado",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        background_color: "#071207",
        theme_color: "#00e040",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
});
