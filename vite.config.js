import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    // mathjs se incluye completo a propósito: el usuario escribe expresiones libres
    // (exp, cos, sqrt, cbrt, pi, ...) que se compilan en tiempo de ejecución, por lo que
    // no es posible hacer tree-shaking. El Service Worker lo precachea una sola vez
    // y a partir de ahí la app funciona 100% offline.
    chunkSizeWarningLimit: 1100,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'icon.svg'],
      manifest: {
        name: 'Calculadora de Métodos Numéricos - Taller 2',
        short_name: 'Métodos Numéricos',
        description: 'PWA para resolución paso a paso de Métodos Numéricos',
        theme_color: '#0f172a',
        background_color: '#090d16',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Las fuentes de Google son el único recurso externo: se cachean en la primera
        // visita con conexión para que la tipografía también se conserve offline.
        // Sin caché la app sigue funcionando con las fuentes del sistema (ver src/index.css).
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
})
