import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  site: 'https://kinetic-car-rental.example.com',
  compressHTML: true,
  prefetch: true,
  integrations: [react()],
  server: {
    // Pinned, not left to Astro's auto-pick. When this was unset the dev server
    // fell through to 4321 and then to 4322 whenever anything else held 4321,
    // so the port moved underneath whatever expected it. `--port` on the CLI
    // still wins if it is passed explicitly.
    port: 3620,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('src'),
      },
    },
  },
});