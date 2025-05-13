import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // REST endpoints
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
      },
      // Socket.IO (WebSocket) endpoint
      '/socket.io': {
        target: process.env.VITE_API_URL,
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
