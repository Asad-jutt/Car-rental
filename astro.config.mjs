import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import path from 'node:path';

/* Every absolute URL the site emits - canonicals, Open Graph, sitemap entries,
 * robots.txt, llms.txt and the JSON-LD `@id` graph - is derived from this one
 * value. It was hardcoded to a placeholder host, so a real launch would have
 * shipped canonicals pointing at `example.com` and quietly deindexed the whole
 * property.
 *
 * `SITE_URL` must be the production origin including scheme, no trailing slash.
 * Falls back to the placeholder only so local dev works; set it in `.env` and in
 * the deploy environment before the first real build. */
const site = process.env.SITE_URL || 'https://kinetic-car-rental.example.com';

if (site.endsWith('/')) {
  throw new Error(`SITE_URL must not end with a slash, got "${site}"`);
}

export default defineConfig({
  site,
  compressHTML: true,
  prefetch: true,
  integrations: [
    react(),
    // Emits /sitemap-index.xml (hashed-name aware) referencing a /sitemap-0.xml
    // that lists every static route, including one per vehicle. `filter` keeps
    // preview deployments out of the index - a non-production host served to a
    // crawler is a canonical-conflict source, not a ranking signal.
    sitemap({
      filter: (page) => !/\/preview\//.test(page),
      serialize(item) {
        if (item.url === `${site}/`) {
          return { ...item, changefreq: 'weekly', priority: 1.0 };
        }
        if (/\/fleet\/[^/]+\/$/.test(item.url)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 };
        }
        if (item.url === `${site}/fleet/`) {
          return { ...item, changefreq: 'weekly', priority: 0.9 };
        }
        if (item.url === `${site}/booking/`) {
          return { ...item, changefreq: 'monthly', priority: 0.7 };
        }
        return { ...item, changefreq: 'monthly', priority: 0.5 };
      },
    }),
  ],
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
