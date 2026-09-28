/**
 * Site identity and absolute-URL helpers.
 *
 * `SITE_URL` is read once here and re-exported so no component has to know how
 * the origin is configured. Everything that emits an absolute URL - canonical
 * tags, Open Graph, JSON-LD `@id` references, the sitemap, robots.txt and
 * llms.txt - resolves through `absoluteUrl()`.
 *
 * Deliberately NOT here: anything that would be a fabricated business fact.
 * No postcode, no founding date, no phone number. Those belong in the NAP
 * block below and stay empty until the owner supplies verified values -
 * invented contact details in `LocalBusiness` schema are a manual-action risk
 * and they poison AI answers, which quote structured data verbatim.
 */

const rawOrigin = import.meta.env.SITE?.replace(/\/+$/, '') ?? '';

/**
 * Resolves a site-absolute path to a full URL. Falls back to a path-only string
 * when `SITE_URL` is unset, which keeps dev builds working; production builds
 * must set it (see `.env.example`).
 */
export function absoluteUrl(pathname = '/'): string {
  if (!rawOrigin) return pathname;
  return new URL(pathname, `${rawOrigin}/`).href;
}

export const BRAND = {
  name: 'KINETIC',
  legalName: 'KINETIC',
  tagline: 'Premium car rental',
  description:
    'Premium car rental with transparent daily rates, insurance included, and 24/7 roadside support. Electric vehicles, sports coupes, and family SUVs.',
  email: 'hello@kineticcars.com',
  /**
   * Placeholder NAP block. Every field is empty and is therefore omitted from
   * structured data. Fill these from a real, verifiable business record before
   * enabling `LocalBusiness` markup or Google Business Profile linking.
   */
  nap: {
    telephone: '',
    streetAddress: '',
    addressLocality: '',
    addressRegion: '',
    postalCode: '',
    addressCountry: '',
  },
} as const;

/** True once the owner has filled in `BRAND.nap`, which unlocks LocalBusiness. */
export function hasVerifiedNap(): boolean {
  const { telephone, streetAddress, addressLocality, addressRegion, postalCode, addressCountry } = BRAND.nap;
  return Boolean(telephone && streetAddress && addressLocality && addressRegion && postalCode && addressCountry);
}
