import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { cspNoncePlugin } from './src/plugins/csp-nonce.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), cspNoncePlugin()],
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:8080 https://vet-backend-production.up.railway.app ws://localhost:*; img-src 'self' data: blob:; frame-ancestors 'none';"
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['primevue']
        }
      }
    },
    // Configuración para CSP más estricta en producción
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
