import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Local dev  → proxy /api to http://localhost:8000 (Django runserver)
// Docker     → Nginx handles /api proxying; VITE_API_TARGET is not needed
const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4200,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
