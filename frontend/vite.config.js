import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: env.VITE_HOST || '192.168.0.10',
      port: parseInt(env.VITE_PORT) || 5173,
      strictPort: true,
    },
    // Example: expose env vars to client
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
    }
  }
})