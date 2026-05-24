import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://nusantara-backend-498485862524.asia-southeast2.run.app',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://nusantara-backend-498485862524.asia-southeast2.run.app',
        changeOrigin: true,
      },
    },
  },
});
