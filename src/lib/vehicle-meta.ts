import type { Car } from '../types';
import { categoryLabel } from './cms';
import { hubName, hubCity } from '../data/fleetData';
import { BRAND } from './site';

/**
 * Canonical identity + presentation helpers for a single vehicle.
 *
 * WHY THESE EXIST: the fleet ships a KINETIC designation (`name`, e.g.
 * "VELOCE GT-R") alongside the real manufacturer and model (`make` + `model`,
 * e.g. "Audi" + "R8"). Searchers do not type "VELOCE GT-R"; they type
 * "Audi R8 rental" or "rent a McLaren 720S in London". Generative engines
 * resolve entities through the same real-world names.
 *
 * So every indexable surface leads with the real manufacturer and model and
 * keeps the KINETIC designation as an `alternateName`. Publishing the nickname
 * as the product name while the spec table says "Audi R8" would be two
 * contradictory identities for one page.
 *
 * The visible brand voice is preserved: the designation is rendered on-page as
 * the fleet call-sign, and the H1 carries the real name because the H1 is the
 * entity a search engine matches.
 */

export const carPath = (car: Car): string => `/fleet/${car.slug}/`;

/** The real-world vehicle name. Primary entity for the page and for schema. */
export const carTitle = (car: Car): string => `${car.make} ${car.model}`;

/** The KINETIC fleet call-sign, used as `alternateName` and as on-page chrome. */
export const carDesignation = (car: Car): string => car.name;

/**
 * schema.org `fuelType` values, derived from the fuel field so the structured
 * data can never drift from the spec table. Returns an array because a plug-in
 * hybrid is genuinely two fuels and collapsing it to one is a false claim.
 */
export function carFuelTypes(car: Car): string[] {
  const fuel = car.fuel.toUpperCase();
  if (fuel.includes('PLUG-IN') || fuel.includes('MILD HYBRID')) return ['Gasoline', 'Electric'];
  if (fuel.includes('ELECTRIC')) return ['Electric'];
  if (fuel.includes('DIESEL')) return ['Diesel'];
  if (fuel.includes('UNLEADED') || fuel.includes('PETROL') || fuel.includes('GASOLINE')) return ['Gasoline'];
  return [];
}

/**
 * `schema.org/Vehicle.speed` is a QuantitativeValue in km/h; the seed stores
 * top speed in mph. Converting keeps the structured data unit-correct instead
 * of publishing a mph figure in a field that declares km/h.
 */
export function carTopSpeedKmh(car: Car): number {
  return Math.round(car.topSpeed * 1.60934);
}

export const carCategoryLabel = (car: Car): string => categoryLabel(car.category);

/** Human-readable collection points, resolved through the corrected hub ids. */
export const carHubNames = (car: Car): string[] => car.hubs.map(hubName);

/**
 * Title tag. Lead with the commercial-intent phrase, then the price anchor,
 * then the brand - which is the pattern that wins the rental SERPs, where the
 * decision is price-sensitive and brand is not yet a factor.
 */
export function carSeoTitle(car: Car): string {
  return `${carTitle(car)} Rental — $${car.pricePer24h}/day | ${BRAND.name}`;
}

/**
 * Meta description. Opens with the answer to the implied question ("can I rent
 * this, and what does it cost") inside the first 60 characters, which is the
 * window both snippets and AI overviews pull from.
 */
export function carSeoDescription(car: Car): string {
  const hubs = carHubNames(car);
  const where = hubs.length
    ? ` Available at ${hubs.length} hub${hubs.length === 1 ? '' : 's'} including ${hubCity(hubs[0])}.`
    : '';
  return `Rent the ${carTitle(car)} — ${car.power} HP, 0–${car.zeroToSixty}s 0–60 mph, ${car.seats} seats. $${car.pricePer24h}/day, insurance and 24/7 roadside included.${where}`;
}

/**
 * Answer-first intro. The first sentence is the one an AI Overview or featured
 * snippet can lift verbatim, so it carries price, class and the headline spec
 * rather than atmosphere.
 */
export function carAnswerFirst(car: Car): string {
  const unavailable = car.available ? '' : ' This car is currently between bookings.';
  return `The ${carTitle(car)} rents from $${car.pricePer24h} per day with insurance and roadside assistance included. It is a ${carCategoryLabel(car).toLowerCase()} producing ${car.power} HP, running ${car.zeroToSixty} seconds to 60 mph, and rated for ${car.seats} passenger${car.seats === 1 ? '' : 's'}.${unavailable}`;
}

/** The spec table rows, in the order a renter actually cares about them. */
export function carSpecRows(car: Car): { label: string; value: string }[] {
  return [
    { label: 'Power', value: `${car.power} ${car.powerUnit}` },
    { label: '0–60 mph', value: `${car.zeroToSixty}s` },
    { label: 'Drivetrain', value: `${car.drive}${car.driveSub ? ` · ${car.driveSub}` : ''}` },
    { label: 'Transmission', value: car.transmission },
    { label: 'Fuel', value: car.fuel },
    { label: 'Range', value: car.range },
    { label: 'Top speed', value: `${car.topSpeed} mph` },
    { label: 'Seats', value: String(car.seats) },
    { label: 'Luggage', value: `${car.luggage} bag${car.luggage === 1 ? '' : 's'}` },
    { label: 'Daily rate', value: `$${car.pricePer24h}` },
  ];
}

/**
 * Gallery alt text, rewritten to lead with the real manufacturer and model.
 *
 * The seed stores alt text beginning with the KINETIC call-sign
 * ("VELOCE GT-R front three-quarter exterior"). For image search and for vision
 * models feeding an AI answer, the recognised entity has to be the real car, so
 * the designation is swapped for the real name and the descriptive half of the
 * string is left untouched.
 */
export function carGalleryAlt(car: Car, alt: string): string {
  const descriptive = alt.replace(car.name, '').replace(/^[\s—-]+/, '').trim();
  const subject = `${carTitle(car)}${descriptive ? ` ${descriptive}` : ''}`;
  return subject.charAt(0).toUpperCase() + subject.slice(1);
}

/** "a" vs "an", chosen from the first letter of the model name. Without this
 *  the question headings read "rent a Audi R8", and a visibly wrong page is
 *  quoted verbatim by answer engines. */
function indefiniteArticle(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

/**
 * Car-specific questions. Deliberately not a copy of the homepage FAQ: these
 * answer what is true of *this* car, which is what a per-vehicle query asks.
 * Emitted as visible headings and as FAQPage markup from this same array, so
 * the structured data and the rendered page cannot disagree.
 */
export function carQuestions(car: Car): { question: string; answer: string }[] {
  const hubs = carHubNames(car);
  const hubList =
    hubs.length > 0 ? hubs.map(hubCity).join(', ') : 'select hubs at checkout';
  const article = indefiniteArticle(carTitle(car));

  return [
    {
      question: `How much does it cost to rent ${article} ${carTitle(car)}?`,
      answer: `The ${carTitle(car)} is $${car.pricePer24h} per 24 hours. That rate includes collision and liability cover and 24/7 roadside assistance, so there is no insurance add-on required at the counter.`,
    },
    {
      question: `How fast is the ${carTitle(car)}?`,
      answer: `The ${carTitle(car)} produces ${car.power} ${car.powerUnit} and reaches 60 mph in ${car.zeroToSixty} seconds, with a top speed of ${car.topSpeed} mph.`,
    },
    {
      question: `How many people can ride in the ${carTitle(car)}?`,
      answer: `The ${carTitle(car)} seats ${car.seats} and carries ${car.luggage} bag${car.luggage === 1 ? '' : 's'} of luggage. It is a ${carCategoryLabel(car).toLowerCase()}.`,
    },
    {
      question: `Where can I pick up the ${carTitle(car)}?`,
      answer: `The ${carTitle(car)} is available for collection in ${hubList}. Choose your hub during booking; counter check-in and verification take under ten minutes.`,
    },
  ];
}
