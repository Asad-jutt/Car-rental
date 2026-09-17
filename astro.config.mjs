import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  site: 'https://kinetic-car-rental.example.com',
  compressHTML: true,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('src'),
      },
    },
  },
});