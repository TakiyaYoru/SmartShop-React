import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Cấu hình cho development server
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
  },
  // Cấu hình cho preview (production)
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173,
    allowedHosts: 'all',
  },
  // Cấu hình build
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});