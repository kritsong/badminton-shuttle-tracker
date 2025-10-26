// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), '');
  return {
    server: { host: '0.0.0.0', port: 3000 },
    plugins: [react()],
    base: '/badminton-shuttle-tracker/',   // <-- IMPORTANT for GitHub Pages
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') }
    }
  };
});
