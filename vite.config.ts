import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const gscToken = env.GOOGLE_SITE_VERIFICATION

  return {
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "inject-google-site-verification",
      transformIndexHtml(html: string) {
        if (!gscToken) return html
        const tag = `<meta name="google-site-verification" content="${gscToken}" />`
        return html.replace("</head>", `  ${tag}\n  </head>`)
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Don't let the SPA navigateFallback swallow these — they must serve
        // their real file when opened directly in a browser (crawlers/GSC).
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/, /^\/llms\.txt$/],
      },
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'recharts';
          if (id.includes('node_modules/firebase')) return 'firebase';
          if (id.includes('node_modules/lucide-react')) return 'lucide';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'react-vendor';
        }
      }
    }
  }
  }
})
