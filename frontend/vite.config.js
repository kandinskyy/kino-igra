import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import {cinemaBuild} from './cinema-build.js'
import {kinonamesDemoPlugin} from './kinonames-demo-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),cinemaBuild(),kinonamesDemoPlugin()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
      '/api': {
        target: 'http://localhost:3001',
      },
    },
  },
})

