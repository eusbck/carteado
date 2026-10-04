import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';

const servidor = process.env.SERVIDOR ?? 'http://localhost:8080';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [preact()],
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 800 },
  server: {
    proxy: {
      '/api': servidor,
      '/img': servidor,
      '/simbolo': servidor,
      '/ws': { target: servidor.replace(/^http/, 'ws'), ws: true },
    },
  },
});
