import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        working: './working.html',
        auth: './auth.html'
      }
    }
  }
})
