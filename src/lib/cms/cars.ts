import type { Car, CarCategory, CarImage } from '../../types';
import { CARS as SEED_CARS, EXTERIOR_ANGLE_POOL } from '../../data/cars.seed';
import { getSanityClient } from './sanity';
import { ASPECT } from './image';

/**
 * The single entry point for car listings.
 *
 * Every surface that shows a car - the homepage fleet matrix, the rotating
 * fleet wheel, the booking picker, the per-car detail page - reads from here, so
 * one edit in the CMS changes the listing everywhere. Nothing imports the raw
 * seed array outside this module.
 *
 * Reads are cached for the lifetime of the build: Astro renders many pages per
 * build and each one would otherwise re-hit the API.
 */

/** GROQ projection. Field names match `Car` so normalisation stays trivial. */
const CAR_PROJECTION = `{
  "id": coalesce(code, _id),
  "slug": slug.current,
  name,
  make,
  model,
  band,
  category,
  statusBadge,
  statusTone,
  desc,
  power,
  powerUnit,
  zeroToSixty,
  drive,
  driveSub,
  pricePer24h,
  "imageUrl": image.asset->url,
  chassis,
  rigLabel,
  seats,
  luggage,
  transmission,
  fuel,
  range,
  topSpeed,
  featured,
  available,
  "hubs": hubs[]->code,
  "gallery": gallery[]{
    "url": asset->url,
    "alt": coalesce(alt, ^.name)
  },
  order
}`;

const ALL_CARS_QUERY = `*[_type == "car" && defined(slug.current)] | order(order asc, pricePer24h asc) ${CAR_PROJECTION}`;

const CAR_CATEGORIES = ['ev', 'hybrid', 'quad'] as const;

/** Filter tab copy. Labels live next to the data so the tabs can never drift
 *  out of sync with the categories the CMS actually serves. */
const CATEGORY_LABELS: Record<CarCategory, string> = {
  ev: 'ELECTRIC',
  hybrid: 'HYBRID SUV',
  quad: 'SPORTS COUPE',
};

const CATEGORY_ORDER: CarCategory[] = ['ev', 'hybrid', 'quad'];

export interface CarFilter {
  id: CarCategory | 'all';
  label: string;
  count: number;
}

function isCarCategory(value: unknown): value is CarCategory {
  return CAR_CATEGORIES.includes(value as CarCategory);
}

function num(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : fallback;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

/** Fills in defaults so a partially filled CMS document still renders. */
function normalizeCar(raw: Record<string, unknown>, index: number): Car {
  const name = str(raw.name, 'UNTITLED VEHICLE');
  const category = isCarCategory(raw.category) ? raw.category : 'quad';

  return {
    id: str(raw.id, `KC-CAR-${index + 1}`),
    slug: str(raw.slug, `car-${index + 1}`),
    name,
    make: str(raw.make, 'KINETIC'),
    model: str(raw.model, name),
    band: str(raw.band, 'STANDARD'),
    category,
    statusBadge: str(raw.statusBadge, '[AVAILABLE]'),
    statusTone: raw.statusTone === 'muted' ? 'muted' : 'orange',
    desc: str(raw.desc, 'Full-spec vehicle from the KINETIC fleet.'),
    power: num(raw.power, 0),
    powerUnit: str(raw.powerUnit, 'HP'),
    zeroToSixty: num(raw.zeroToSixty, 0),
    drive: str(raw.drive, 'RWD'),
    driveSub: str(raw.driveSub, ''),
    pricePer24h: num(raw.pricePer24h, 0),
    imageUrl: str(raw.imageUrl),
    chassis: str(raw.chassis, 'STANDARD PACKAGE'),
    rigLabel: str(raw.rigLabel, 'AUTO + BASIC COVER INCLUDED'),
    seats: num(raw.seats, 2),
    luggage: num(raw.luggage, 1),
    transmission: str(raw.transmission, 'AUTOMATIC'),
    fuel: str(raw.fuel, 'PETROL'),
    range: str(raw.range, '-'),
    topSpeed: num(raw.topSpeed, 0),
    featured: raw.featured === true,
    available: raw.available !== false,
    hubs: Array.isArray(raw.hubs) ? raw.hubs.filter((h): h is string => typeof h === 'string') : [],
    gallery: Array.isArray(raw.gallery)
      ? raw.gallery
          .map((g): CarImage | null => {
            const item = g as Record<string, unknown>;
            const url = str(item?.url);
            return url ? { url, alt: str(item?.alt, name) } : null;
          })
          .filter((g): g is CarImage => g !== null)
      : [],
    order: num(raw.order, index + 1),
  };
}

let cache: Promise<Car[]> | null = null;

/**
 * All listings, CMS first and local seed as the fallback.
 *
 * A CMS outage degrades to the seed instead of failing the build: a broken
 * external service should never take the site down with it.
 */
export function getCars(): Promise<Car[]> {
  if (!cache) cache = loadCars();
  return cache;
}

async function loadCars(): Promise<Car[]> {
  const client = getSanityClient();

  if (!client) {
    if (import.meta.env.DEV) {
      console.info('[cms] PUBLIC_SANITY_PROJECT_ID not set - serving the local seed fleet.');
    }
    return SEED_CARS;
  }

  try {
    const docs = await client.fetch<Record<string, unknown>[]>(ALL_CARS_QUERY);
    if (!docs?.length) {
      console.warn('[cms] Sanity returned no car documents - serving the local seed fleet.');
      return SEED_CARS;
    }
    return docs.map(normalizeCar);
  } catch (error) {
    console.warn('[cms] Failed to fetch cars from Sanity - serving the local seed fleet.', error);
    return SEED_CARS;
  }
}

/** Cached lookup helpers, all reading the same fetched set. */
export async function getAvailableCars(): Promise<Car[]> {
  return (await getCars()).filter((car) => car.available);
}

export async function getCarBySlug(slug: string): Promise<Car | undefined> {
  const cars = await getCars();
  return cars.find((car) => car.slug === slug);
}

export async function getCarById(id: string): Promise<Car | undefined> {
  const cars = await getCars();
  return cars.find((car) => car.id === id);
}

/** Every category the CMS actually has listings for, ordered for the UI. */
export async function getCarCategories(): Promise<CarCategory[]> {
  const cars = await getCars();
  const present = new Set(cars.map((car) => car.category));
  return CATEGORY_ORDER.filter((category) => present.has(category));
}

/** Filter tabs for the fleet matrix, with live counts from the CMS. */
export async function getCarFilters(): Promise<CarFilter[]> {
  const cars = await getCars();
  const tabs: CarFilter[] = [
    { id: 'all', label: 'ALL VEHICLES', count: cars.length },
    ...CATEGORY_ORDER.filter((category) => cars.some((car) => car.category === category)).map<CarFilter>(
      (category) => ({
        id: category,
        label: CATEGORY_LABELS[category],
        count: cars.filter((car) => car.category === category).length,
      }),
    ),
  ];
  return tabs;
}

export const categoryLabel = (category: CarCategory): string => CATEGORY_LABELS[category];

/**
 * Exterior angles for the rotating fleet wheel: the listing's own gallery first,
 * topped up from the shared exterior pool so every car gets the same number of
 * cards. Duplicates are dropped - the pool deliberately overlaps the galleries.
 */
export function wheelAnglesFor(car: Car, size: number): string[] {
  const own = [car.imageUrl, ...car.gallery.map((g) => g.url)].filter(Boolean);
  const angles: string[] = [];

  for (const url of [...own, ...EXTERIOR_ANGLE_POOL]) {
    if (angles.length >= size) break;
    if (!angles.includes(url)) angles.push(url);
  }

  return angles;
}

export { ASPECT, EXTERIOR_ANGLE_POOL };
