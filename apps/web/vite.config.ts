import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // chemins relatifs : le build fonctionne aussi sur GitHub Pages (sous-dossier)
  base: './',
  server: {
    port: 5173,
    // en local, /api est relayé vers `wrangler dev`
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
});
