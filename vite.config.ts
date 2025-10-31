import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  // SECURITY: API keys are NO LONGER exposed to frontend
  // All API calls now go through backend proxy at localhost:3001
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
