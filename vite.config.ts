// vite.config.ts (clean)
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), ''); // makes .env values available as import.meta.env
  return {
    server: { host: '0.0.0.0', port: 3000 }, // you'll open http://localhost:3000
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') }
    }
  };
});
