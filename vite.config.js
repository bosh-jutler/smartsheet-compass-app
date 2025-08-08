import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxying API requests to the FastAPI backend
      '/api': {
        target: 'http://localhost:8000', // Your backend server
        changeOrigin: true,
      },
    },
  },
})