export type CarCategory = 'ev' | 'hybrid' | 'quad';

export interface CarImage {
  url: string;
  alt: string;
}

/** A car listing. The single shape every part of the site renders, whether the
 *  record came from the Sanity CMS or from the local seed fallback. */
export interface Car {
  id: string;
  slug: string;
  name: string;
  make: string;
  model: string;
  band: string;
  category: CarCategory;
  statusBadge: string;
  statusTone: 'orange' | 'muted';
  desc: string;
  power: number;
  powerUnit: string;
  zeroToSixty: number;
  drive: string;
  driveSub: string;
  pricePer24h: number;
  imageUrl: string;
  chassis: string;
  rigLabel: string;
  seats: number;
  luggage: number;
  transmission: string;
  fuel: string;
  range: string;
  topSpeed: number;
  featured: boolean;
  available: boolean;
  /** Hub codes from `HUBS` the car can be collected from. */
  hubs: string[];
  /** Extra exterior angles, used by the rotating fleet wheel and detail page. */
  gallery: CarImage[];
  /** Manual CMS ordering for the matrix grid. Lower sorts first. */
  order: number;
}

/** @deprecated Use `Car` from the CMS layer. Kept so existing imports resolve. */
export type Vehicle = Car;

export interface ProtocolStep {
  stepNumber: string;
  code: string;
  title: string;
  description: string;
  paramLabel: string;
  stepFraction: string;
}

export interface SyndicateTier {
  id: string;
  tierNumber: string;
  statusBadge: string;
  name: string;
  price: string;
  priceSub: string;
  featured?: boolean;
  slotsRemaining?: string;
  features: {
    included: boolean;
    text: string;
  }[];
  buttonText: string;
}

export interface DriverLog {
  id: string;
  dispatchHash: string;
  node: string;
  quote: string;
  author: string;
  title: string;
  stat1Label: string;
  stat1Val: string;
  stat2Label: string;
  stat2Val: string;
}

export interface FaqItem {
  id: string;
  code: string;
  question: string;
  answer: string;
}
