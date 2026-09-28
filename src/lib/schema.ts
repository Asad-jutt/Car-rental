import type { Car, FaqItem } from '../types';
import { BRAND, absoluteUrl, hasVerifiedNap } from './site';
import { carPath, carTitle, carFuelTypes, carTopSpeedKmh, carDesignation, carHubNames } from './vehicle-meta';

/**
 * schema.org/JSON-LD builders.
 *
 * Every node uses a stable `@id` so the graph links together: the
 * `Organization` is referenced by `@id` from the offers, and the `WebSite`
 * `publisher` points at the same node. Interlinked `@id`s are how a consumer
 * (Google's entity graph, or a retrieval-augmented answer engine) resolves
 * "who is the seller" instead of treating each page as an anonymous offer.
 *
 * `SCHEMA_CONTEXT` is emitted as `@context` on the first node only and skipped
 * on the rest, so a page with five nodes produces one valid graph rather than
 * five independently-scoped documents.
 */

export const SCHEMA_CONTEXT = 'https://schema.org';

const ORG_ID = () => absoluteUrl('/#organization');
const WEBSITE_ID = () => absoluteUrl('/#website');

/** Internal helper so only the first node carries `@context`. */
type Node = Record<string, unknown>;

/**
 * The brand as a single node, referenced by `@id` from everywhere else.
 *
 * Deliberately omits `aggregateRating`, `review` and `sameAs`: the on-page
 * testimonials are first-name-only and unverified, and no social profiles have
 * been confirmed as belonging to this business. Publishing review markup that
 * cannot be substantiated is a manual-action trigger, and quoting a fabricated
 * rating in an AI answer is worse than having none.
 *
 * `contactPoint` and `address` appear only once `BRAND.nap` is filled with
 * verified values - see `hasVerifiedNap`.
 */
export function organizationSchema(): Node {
  const node: Node = {
    '@type': 'Organization',
    '@id': ORG_ID(),
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: absoluteUrl('/'),
    description: BRAND.description,
    email: BRAND.email,
  };

  if (hasVerifiedNap()) {
    const { telephone, streetAddress, addressLocality, addressRegion, postalCode, addressCountry } = BRAND.nap;
    node.telephone = telephone;
    node.address = {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality,
      addressRegion,
      postalCode,
      addressCountry,
    };
    node.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'reservations',
      telephone,
      email: BRAND.email,
      availableLanguage: 'English',
      areaServed: 'US, GB',
    };
  }

  return node;
}

export function webSiteSchema(): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID(),
    url: absoluteUrl('/'),
    name: BRAND.name,
    description: BRAND.description,
    publisher: { '@id': ORG_ID() },
    inLanguage: 'en',
  };
}

/**
 * FAQPage for the visible FAQ accordion. Only valid because the answers on
 * page are the same text rendered in the accordion - the markup is generated
 * from the same `FAQS` array the component renders, so they cannot drift.
 */
export function faqPageSchema(items: FaqItem[]): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl('/')}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(trail: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(trail[trail.length - 1]?.path ?? '/')}#breadcrumb`,
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * A single rental listing.
 *
 * Typed as `Product` + `Car` so it is a valid `Product` for Google's offer
 * parsing while still exposing the vehicle-specific properties. The product
 * `name` is the real manufacturer and model, with the KINETIC call-sign as
 * `alternateName` - see the reasoning in `vehicle-meta.ts`.
 *
 * `offers` is an `AggregateOffer` because the headline rate is a from-price
 * (per 24h) and the page also lists weekend and monthly rates. Pricing is
 * per-24h, which is stated on-page and in the offer `name` so the number is
 * never read as a total.
 */
export function vehicleSchema(car: Car): Node {
  const url = absoluteUrl(carPath(car));
  const hubs = carHubNames(car);

  return {
    '@type': ['Product', 'Car'],
    '@id': `${url}#vehicle`,
    name: carTitle(car),
    alternateName: carDesignation(car),
    url,
    description: car.desc,
    image: [car.imageUrl],
    sku: car.id,
    category: carCategoryForSchema(car),
    ...(carFuelTypes(car).length ? { fuelType: carFuelTypes(car) } : {}),
    vehicleTransmission: car.transmission,
    vehicleConfiguration: `${car.seats}-seat ${car.drive} ${car.category === 'quad' ? 'sports coupe' : car.category === 'ev' ? 'electric vehicle' : 'hybrid SUV'}`,
    seatingCapacity: car.seats,
    speed: {
      '@type': 'QuantitativeValue',
      minValue: 0,
      maxValue: carTopSpeedKmh(car),
      unitCode: 'KMH',
    },
    vehicleEngine: {
      '@type': 'EngineSpecification',
      name: car.driveSub || undefined,
      enginePower: {
        '@type': 'QuantitativeValue',
        value: car.power,
        unitCode: 'BHP',
      },
    },
    brand: {
      '@type': 'Brand',
      name: car.make,
    },
    offers: {
      '@type': 'AggregateOffer',
      '@id': `${url}#offer`,
      name: `${carTitle(car)} rental rate per 24 hours`,
      url,
      priceCurrency: 'USD',
      lowPrice: car.pricePer24h,
      highPrice: car.pricePer24h,
      offerCount: 1,
      availability: car.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@id': ORG_ID() },
      areaServed: hubs.length ? hubs : undefined,
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        unitCode: 'DAY',
      },
    },
  };
}

function carCategoryForSchema(car: Car): string {
  if (car.category === 'ev') return 'Electric vehicle';
  if (car.category === 'hybrid') return 'Hybrid SUV';
  return 'Sports coupe';
}

/**
 * The fleet as an ordered list. Gives the answer engines an enumerable,
 * machine-readable version of what `/fleet` shows visually, which is the
 * shape they lift for "what cars can I rent" style queries.
 */
export function fleetListSchema(cars: Car[]): Node {
  return {
    '@type': 'ItemList',
    '@id': `${absoluteUrl('/fleet/')}#fleet`,
    name: `${BRAND.name} rental fleet`,
    numberOfItems: cars.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: cars.map((car, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: carTitle(car),
      alternateName: carDesignation(car),
      url: absoluteUrl(carPath(car)),
    })),
  };
}

/** The three published rate tiers, as real `Offer` nodes. */
export function offerCatalogSchema(
  tiers: { id: string; name: string; price: number; description: string }[],
): Node {
  return {
    '@type': 'OfferCatalog',
    '@id': `${absoluteUrl('/')}#rates`,
    name: `${BRAND.name} rental rates`,
    itemListElement: tiers.map((tier) => ({
      '@type': 'Offer',
      name: `${tier.name} rate`,
      description: tier.description,
      price: tier.price,
      priceCurrency: 'USD',
      url: absoluteUrl('/booking/'),
      seller: { '@id': ORG_ID() },
    })),
  };
}

/** The published rate tiers, for `offerCatalogSchema`. */
export const RATE_TIERS = [
  { id: 'daily-rate', name: 'Daily', price: 89, description: 'Any available car, 100 miles included per day.' },
  { id: 'weekend', name: 'Weekend', price: 159, description: 'Unlimited weekend mileage, free additional driver, complimentary airport pickup.' },
  { id: 'monthly', name: 'Monthly', price: 1899, description: 'Unlimited mileage, flexible vehicle swaps, dedicated account manager.' },
] as const;
