export type FontPreset = 'unbounded' | 'syncopate' | 'chakra' | 'syne';

export interface Vehicle {
  id: string;
  name: string;
  band: string;
  category: 'ev' | 'hybrid' | 'quad';
  tag: string;
  statusBadge: string;
  statusTone: 'orange' | 'green' | 'muted';
  desc: string;
  power: number;
  powerUnit: string;
  zeroToSixty: number;
  drive: string;
  driveSub: string;
  pwrWt: string;
  secondarySpecLabel: string;
  secondarySpecVal: string;
  rangeOrEscrow: string;
  pricePer24h: number;
  imageUrl: string;
  chassis: string;
  rigLabel: string;
}

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
