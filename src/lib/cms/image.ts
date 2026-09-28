const UNSPLASH_HOSTS = new Set(['images.unsplash.com', 'plus.unsplash.com']);

export interface ImageSize {
  w?: number;
  h?: number;
  q?: number;
}

/** Card aspect ratios used across the site, so we can request crops from the CDN
 *  that match the slot exactly instead of letting `object-cover` trim pixels the
 *  browser already paid to download. */
export const ASPECT = {
  matrixCard: { w: 1000, h: 625 }, // FleetMatrix card   -> 16/10
  reelCard: { w: 600, h: 800 }, // FleetReel card      -> 3/4
  wheelCard: { w: 900, h: 600 }, // rotating fleet wheel -> 3/2
  thumb: { w: 640, h: 360 }, // booking picker       -> 16/9
} as const;

/**
 * Returns a delivery URL for `url` at the requested pixel size.
 *
 * Unsplash-style CDNs are resized server side via query params, so a 16/10 slot
 * gets a real 16/10 file: no double download, no `object-cover` crop, and the
 * aspect ratio the layout reserves is the aspect ratio that arrives.
 *
 * Any other host (Sanity's image pipeline, an S3 bucket, a hand-uploaded file)
 * is returned untouched rather than being mangled with params it cannot read.
 */
export function sizedImage(url: string, { w, h, q = 80 }: ImageSize = {}): string {
  if (!url) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return url;
  if (!UNSPLASH_HOSTS.has(parsed.hostname)) return url;

  parsed.searchParams.set('auto', 'format');
  parsed.searchParams.set('fit', 'crop');
  parsed.searchParams.set('q', String(q));
  if (w) parsed.searchParams.set('w', String(w));
  if (h) parsed.searchParams.set('h', String(h));
  else parsed.searchParams.delete('h');
  if (!h) parsed.searchParams.delete('crop');

  return parsed.toString();
}

/** Convenience wrapper for the fleet matrix card slot. */
export const matrixImage = (url: string) => sizedImage(url, ASPECT.matrixCard);
