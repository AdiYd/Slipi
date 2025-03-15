import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // port: 3000,
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'b07f-2a0d-6fc2-60e0-c200-ccf8-90b5-f4a1-5446.ngrok-free.app'
    ]
  },
})
