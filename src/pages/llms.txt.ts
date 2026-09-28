import type { APIRoute } from 'astro';
import { absoluteUrl, BRAND } from '../lib/site';
import { getCars } from '../lib/cms';
import { HUBS, hubFull } from '../data/fleetData';
import { SYNDICATE_TIERS, FAQS } from '../data/fleetData';
import { carPath, carTitle, carDesignation } from '../lib/vehicle-meta';

/**
 * /llms.txt — the llmstxt.org convention: a Markdown brief that a retrieval
 * system can read in one pass to learn what the business is, what it sells, and
 * where the authoritative pages are.
 *
 * Generated from the same `getCars()` / `HUBS` / `FAQS` sources the pages
 * render, so it cannot describe a fleet the site does not have. That
 * single-sourcing is the point: a hand-maintained llms.txt drifts within a
 * month, and a stale llms.txt actively misinforms an answer engine.
 *
 * Follows the H1-then-blockquote-then-sections shape from the spec, and keeps
 * every claim to something already visible and verifiable on the site.
 */
const build = async (): Promise<string> => {
  const cars = await getCars();
  const hubs = HUBS.map((h) => hubFull(h.id)).join('; ');

  const lines: string[] = [
    `# ${BRAND.name}`,
    '',
    `> ${BRAND.description}`,
    '',
    '## What this is',
    '',
    `${BRAND.name} is a premium car rental service. Customers book by the day,`,
    'weekend, or month. Every rate includes collision and liability cover and',
    '24/7 roadside assistance. Counter check-in takes under ten minutes.',
    '',
    `Collection hubs: ${hubs}.`,
    '',
    '## How to book',
    '',
    `Booking is a three-step form: choose a vehicle, pick a hub and dates, then`,
    `submit driver details. Start here: ${absoluteUrl('/booking/')}`,
    '',
    '## Rates',
    '',
    'Three published tiers, all inclusive of insurance and roadside assistance:',
    '',
    ...SYNDICATE_TIERS.map(
      (tier) =>
        `- **${tier.name}** (${tier.priceSub.toLowerCase()}): ${tier.price}. ${
          tier.features
            .filter((f) => f.included)
            .slice(0, 3)
            .map((f) => f.text)
            .join('; ')
        }.`,
    ),
    '',
    `Full tier detail: ${absoluteUrl('/#tiers')}`,
    '',
    '## Fleet',
    '',
    `${cars.length} vehicles. Per-vehicle pages carry full specifications, daily`,
    'rate, and collection hubs.',
    '',
    ...cars.map((car) => {
      const status = car.available ? 'Available to book' : 'Currently between bookings';
      return `- [${carTitle(car)}](${absoluteUrl(carPath(car))}): ${carDesignation(car)}. ${car.power} HP, 0-${car.zeroToSixty}s 0-60 mph, ${car.seats} seats, $${car.pricePer24h}/day. ${status}.`;
    }),
    '',
    `Fleet index: ${absoluteUrl('/fleet/')}`,
    '',
    '## Requirements and policies',
    '',
    ...FAQS.map((faq) => `- **${faq.question}** ${faq.answer}`),
    '',
    '## Key pages',
    '',
    `- [Home](${absoluteUrl('/')}): overview, fleet summary, rates, reviews.`,
    `- [Fleet index](${absoluteUrl('/fleet/')}): all ${cars.length} vehicles.`,
    `- [Booking](${absoluteUrl('/booking/')}): the reservation form.`,
    '',
    '## Contact',
    '',
    `Email: ${BRAND.email}. Reservations are handled 24/7.`,
    '',
    '## Optional',
    '',
    '- [Pricing detail](https://schema.org/Offer): rate structure in structured data.',
    '- [FAQ answers](https://schema.org/FAQPage): the same policy answers in JSON-LD.',
    '',
  ];

  return lines.join('\n');
};

export const GET: APIRoute = async () =>
  new Response(await build(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
