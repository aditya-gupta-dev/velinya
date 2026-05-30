import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'app-icon.jpg',
        'pwa/icon-192.jpg',
        'pwa/icon-512.jpg',
        'pwa/screenshot-wide.png',
        'pwa/screenshot-mobile.png'
      ],
      manifest: {
        name: 'Velinya',
        short_name: 'Velinya',
        description: 'Your notes & todos, beautifully organized',
        theme_color: '#e8ebe6',
        background_color: '#e8ebe6',
        display: 'standalone',
        icons: [
          {
            src: 'pwa/icon-192.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: 'pwa/icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: 'pwa/icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'pwa/screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Velinya desktop notes and todos workspace'
          },
          {
            src: 'pwa/screenshot-mobile.png',
            sizes: '720x1280',
            type: 'image/png',
            label: 'Velinya mobile notes and todos view'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
