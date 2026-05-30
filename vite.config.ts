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
      includeAssets: ['app-icon.jpg'],
      manifest: {
        name: 'Velinya',
        short_name: 'Velinya',
        description: 'Your notes & todos, beautifully organized',
        theme_color: '#e8ebe6',
        background_color: '#e8ebe6',
        display: 'standalone',
        icons: [
          {
            src: 'app-icon.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
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
