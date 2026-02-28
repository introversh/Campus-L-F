import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'https://campus-l-f.onrender.com', changeOrigin: true },
      // Proxy socket.io WebSocket connections to the NestJS backend
      '/socket.io': {
        target: 'https://campus-l-f.onrender.com',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/socket\.io/, '/socket.io'),
      },
    },
  },
})
