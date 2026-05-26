import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/fhir': { target: 'http://localhost:8000', changeOrigin: true },
      '/admin': { target: 'http://localhost:8000', changeOrigin: true },
      '/inference': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts')) return 'charts';
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor';
          if (id.includes('node_modules/react/')) return 'vendor';
        },
      },
    },
  },
})
