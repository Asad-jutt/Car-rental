import { createClient, type SanityClient } from '@sanity/client';

/**
 * Sanity connection for the car-listing CMS.
 *
 * Everything here is build-time only: Astro renders the site statically, so
 * listings are fetched during the build and baked into the HTML. The browser
 * never talks to Sanity, which means the public dataset can stay open and no
 * read token is ever shipped to the client.
 *
 * With no `PUBLIC_SANITY_PROJECT_ID` set, `isCmsConfigured` is false and the
 * repository falls back to the local seed - so a fresh clone renders a complete
 * fleet before anyone has created a Sanity project.
 */

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION ?? '2024-10-01';

export const isCmsConfigured = Boolean(projectId);

let client: SanityClient | null = null;

/** Returns a configured client, or `null` when the CMS is not wired up yet. */
export function getSanityClient(): SanityClient | null {
  if (!isCmsConfigured) return null;
  if (!client) {
    client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: 'published',
    });
  }
  return client;
}
