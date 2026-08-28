import { execSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'

import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import VitePluginVueDevTools from 'vite-plugin-vue-devtools'

// Get commit hash
let commitHash = process.env.VERCEL_GIT_COMMIT_SHA || ''
if (!commitHash) {
  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    commitHash = 'unknown'
  }
}
const shortCommitHash = commitHash.slice(0, 7)

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1200,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/')) {
            if (id.includes('@supabase/supabase-js')) return 'vendor-supabase'
            if (id.includes('mapbox-gl')) return 'vendor-mapbox'
            if (id.includes('@headlessui/vue')) return 'vendor-ui'
            if (id.match(/date-fns|fuse\.js|validator/)) return 'vendor-utility'
            if (id.match(/vue|vue-router|pinia/)) return 'vendor-vue'
          }
        },
      },
    },

    sourcemap: true,
  },

  define: {
    __COMMIT_HASH__: JSON.stringify(shortCommitHash),
  },

  plugins: [
    vue(),
    VitePluginVueDevTools(),
    tailwindcss(),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'psiderman',
      project: 'website',
      telemetry: false,
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5174,
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'http://localhost:3001',
      },
    },
    strictPort: true,
  },
})
