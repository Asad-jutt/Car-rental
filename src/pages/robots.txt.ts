import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/site';

/**
 * robots.txt, generated at build time so the sitemap URL tracks `SITE_URL`
 * instead of being a hardcoded hostname that goes stale.
 *
 * AI-crawler policy, stated explicitly because the default is otherwise
 * ambiguous and the crawlers are not in the `User-agent: *` group:
 *
 *   - ALLOWED: the search/index crawlers (OAI-SearchBot, ChatGPT-User,
 *     PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended, ...).
 *     Blocking these is what removes a site from AI answers. This is the
 *     single highest-leverage line in the file for AEO/GEO.
 *   - ALLOWED, DELIBERATELY: the training crawlers (GPTBot, Google-Extended,
 *     CCBot, Bytespider, meta-externalagent). They are kept crawlable so the
 *     brand can be cited in model answers. If the owner ever wants to opt out
 *     of training while staying in AI search, set the two `Disallow: /` lines
 *     marked OPT-OUT below to `Allow: /` -> `Disallow: /`. Nothing else changes.
 *
 * There is deliberately no `Disallow` for the booking flow: the form is the
 * primary conversion and blocking it would block the money path.
 */
const CRAWLERS_ALLOWED = [
  // --- AI search / retrieval (needed for citations) ---
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-User',
  'Google-Extended',
  'Applebot-Extended',
  'DuckAssistBot',
  'Amazonbot',
  // --- AI training (OPT-OUT: replace with `Disallow: /` to exclude) ---
  'GPTBot',
  'CCBot',
  'Bytespider',
  'meta-externalagent',
  'cohere-ai',
  'Diffbot',
  'FacebookBot',
  'YouBot',
];

const body = [
  '# robots.txt for KINETIC',
  `# Generated at build time. Sitemap origin follows SITE_URL.`,
  '',
  'User-agent: *',
  'Allow: /',
  '',
  '# Explicitly welcome the search and retrieval crawlers that decide whether',
  '# this site is cited in AI answers. None of these fall under `User-agent: *`.',
  ...CRAWLERS_ALLOWED.map((bot) => [`User-agent: ${bot}`, 'Allow: /'].join('\n')),
  '',
  `# Machine-readable brief for answer engines: ${absoluteUrl('/llms.txt')}`,
  '',
  `Sitemap: ${absoluteUrl('/sitemap-index.xml')}`,
  '',
].join('\n');

export const GET: APIRoute = () =>
  new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
