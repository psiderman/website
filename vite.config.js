import { sentryVitePlugin } from "@sentry/vite-plugin";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    sentryVitePlugin({
      org: "psiderman",
      project: "website",
      telemetry: false,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
    port: 5174,
    strictPort: true,
  },

  build: {
    sourcemap: true,
  },
});
