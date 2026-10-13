import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  if (mode === 'production') {
    let apiUrl
    try {
      apiUrl = new URL(env.VITE_API_URL)
    } catch {
      throw new Error('Set VITE_API_URL to the production API HTTPS URL before building.')
    }

    if (
      apiUrl.protocol !== 'https:' ||
      ['localhost', '127.0.0.1', '::1'].includes(apiUrl.hostname)
    ) {
      throw new Error('Production VITE_API_URL must use HTTPS and cannot point to localhost.')
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
