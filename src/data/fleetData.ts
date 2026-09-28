import type { ProtocolStep, SyndicateTier, DriverLog, FaqItem } from '../types';

/* Car listings deliberately do NOT live here. They are served by the CMS layer
 * in `src/lib/cms` (Sanity, with the local seed as a fallback) so a single edit
 * updates the fleet matrix, the fleet wheel, the booking picker, and every
 * detail page. Import `getCars()` from `../lib/cms` instead. */

export const BRAND_LOGO =
  'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 fill=%27%23ff5a00%27/%3E%3Ctext x=%2716%27 y=%2723%27 font-family=%27Arial%27 font-size=%2718%27 font-weight=%27bold%27 fill=%27%23000%27 text-anchor=%27middle%27%3EK%3C/text%3E%3C/svg%3E';
export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1200&auto=format&fit=crop';

export const CTA_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvPqDBevHzE2mjhsF-JMeVghgad9qSYUTzgvCLzI0KkvxmRieRfZr0pwqm5RJeDuGssRaz3nVlO6nuYFLMo-T2k_kWyCHubPlqkE8a4gSmW-YbVfhrYBnl2nXmbA6nK3k60Yi1EFVUN3odiBL66PDl3PHh-CJxNyQwMlP3doFiVs_wKSeb221Iug-aJR58X0DZ6YnJK_ju-yNmjt-inq3ZD38ijsjMnfz-O-bEC5KMnJtmOFSrn0jx';

export const PROTOCOL_STEPS: ProtocolStep[] = [
  {
    stepNumber: '01',
    code: '[STEP: BROWSE]',
    title: 'CHOOSE YOUR VEHICLE',
    description: 'Explore our fleet of EVs, sports coupes, and family SUVs. Filter by price, fuel type, seating, and availability across locations.',
    paramLabel: 'FLEET: 12+ VEHICLES',
    stepFraction: '01/04',
  },
  {
    stepNumber: '02',
    code: '[STEP: BOOK]',
    title: 'PICK DATES & LOCATION',
    description: 'Select your pickup and drop-off branch, travel dates, and optional add-ons like navigation, child seats, or additional drivers in minutes.',
    paramLabel: 'BOOKING: ONLINE',
    stepFraction: '02/04',
  },
  {
    stepNumber: '03',
    code: '[STEP: DOCS]',
    title: 'DRIVER & LICENSE CHECK',
    description: 'Bring a valid driver\u2019s license and a payment card. Instant verification at the counter keeps the whole process under ten minutes.',
    paramLabel: 'CHECK-IN: < 10 MIN',
    stepFraction: '03/04',
  },
  {
    stepNumber: '04',
    code: '[STEP: DRIVE]',
    title: 'START YOUR TRIP',
    description: 'Grab your keys, do a quick walkaround, and head out. Included insurance, 24/7 roadside assistance, and easy airport returns.',
    paramLabel: 'SUPPORT: ROADSIDE 24/7',
    stepFraction: '04/04',
  },
];

export const SYNDICATE_TIERS: SyndicateTier[] = [
  {
    id: 'daily-rate',
    tierNumber: '[TARIFF_01 // FLEXIBLE]',
    statusBadge: 'PAY-AS-YOU-GO',
    name: 'DAILY RATE',
    price: '$89',
    priceSub: 'PER DAY',
    features: [
      { included: true, text: 'Any available car from the fleet' },
      { included: true, text: '100 miles included per day' },
      { included: true, text: 'Basic collision & liability cover included' },
      { included: false, text: 'Free unlimited mileage' },
      { included: false, text: 'Priority counter & delivery' },
    ],
    buttonText: 'BOOK DAILY →',
  },
  {
    id: 'weekend',
    tierNumber: '[TARIFF_02 // POPULAR]',
    statusBadge: 'MOST BOOKED',
    name: 'WEEKEND',
    price: '$159',
    priceSub: 'PER DAY',
    featured: true,
    slotsRemaining: 'BEST VALUE',
    features: [
      { included: true, text: 'Unlimited weekend mileage' },
      { included: true, text: 'Free additional driver included' },
      { included: true, text: '30-minute express check-in' },
      { included: true, text: 'Free cancellation up to 24h before pickup' },
      { included: true, text: 'Complimentary airport pickup' },
    ],
    buttonText: 'RESERVE WEEKEND →',
  },
  {
    id: 'monthly',
    tierNumber: '[TARIFF_03 // LONG TERM]',
    statusBadge: 'SAVE MORE',
    name: 'MONTHLY',
    price: '$1,899',
    priceSub: 'PER MONTH',
    features: [
      { included: true, text: 'Unlimited mileage, all month long' },
      { included: true, text: '2,400 minutes driving included' },
      { included: true, text: 'Flexible swap to another car anytime' },
      { included: true, text: 'Dedicated account manager' },
      { included: true, text: 'Corporate invoicing supported' },
    ],
    buttonText: 'START MONTHLY →',
  },
];

export const DRIVER_LOGS: DriverLog[] = [
  {
    id: 'log-1',
    dispatchHash: '[VERIFIED REV // NYC-1102]',
    node: 'BRANCH: LOWER MANHATTAN',
    quote: '"Booked the Veloce GT-R in under ten minutes online. The car was spotless, the checkout was quick, and the return at the airport took seconds. Exactly what a rental should be."',
    author: 'SARAH C.',
    title: 'RETURNING CUSTOMER // 6 BOOKINGS',
    stat1Label: 'BOOKING TIME:',
    stat1Val: '9 MIN',
    stat2Label: 'RATING:',
    stat2Val: '5.0',
  },
  {
    id: 'log-2',
    dispatchHash: '[VERIFIED REV // LON-0318]',
    node: 'BRANCH: KENSINGTON',
    quote: '"Needed a roomy SUV for a week-long family trip to the coast. The Aegis SUV held all our luggage and the kiddos comfortably. The free extra driver made it effortless."',
    author: 'DANIEL P.',
    title: 'FAMILY ROAD TRIP // 7 DAYS',
    stat1Label: 'VEHICLE:',
    stat1Val: 'AEGIS SUV',
    stat2Label: 'RATING:',
    stat2Val: '4.9',
  },
  {
    id: 'log-3',
    dispatchHash: '[VERIFIED REV // SFO-0994]',
    node: 'BRANCH: AIRPORT T-1',
    quote: '"Corporate travel is way smoother with the monthly plan. Unlimited mileage, flexible swaps, and invoicing handled automatically. Our whole team uses Kinetic now."',
    author: 'AMARA O.',
    title: 'CORPORATE ACCOUNT // 12 BOOKINGS',
    stat1Label: 'PLAN:',
    stat1Val: 'MONTHLY',
    stat2Label: 'RATING:',
    stat2Val: '5.0',
  },
];

export const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    code: '[FAQ_01]',
    question: 'WHAT DO I NEED TO PICK UP A CAR?',
    answer: 'A valid driver\u2019s license held for at least one year, a payment card in the renter\u2019s name, and proof of age (21+ for most vehicles; 25+ for sports classes). Instant verification at the counter takes under ten minutes.',
  },
  {
    id: 'faq-2',
    code: '[FAQ_02]',
    question: 'IS INSURANCE INCLUDED IN THE RATE?',
    answer: 'Yes. Every booking includes basic collision and liability cover for the duration of your rental. You can also add full zero-deductible protection, breakdown cover, and windshield & tire protection at checkout.',
  },
  {
    id: 'faq-3',
    code: '[FAQ_03]',
    question: 'CAN I CANCEL OR CHANGE MY RESERVATION?',
    answer: 'Reservations can be cancelled or changed for free up to 24 hours before your scheduled pickup. Changes made inside 24 hours are subject to a fee equal to one day\u2019s rate. Weekend and monthly plans follow the same policy.',
  },
  {
    id: 'faq-4',
    code: '[FAQ_04]',
    question: 'IS THERE A MILEAGE LIMIT?',
    answer: 'Daily and weekend rates include 100 miles per day with the option to top up to unlimited mileage. The Monthly plan includes unlimited mileage throughout your rental, plus flexible swaps to any vehicle in the fleet.',
  },
];

export const HUBS = [
  { id: 'nyc', name: 'NEW YORK // LOWER MANHATTAN', code: 'NYC', status: 'OPEN NOW', latency: '5 MIN' },
  { id: 'lon', name: 'LONDON // KENSINGTON', code: 'LON', status: 'OPEN NOW', latency: '4 MIN' },
  { id: 'tyo', name: 'SAN FRANCISCO // AIRPORT T-1', code: 'SFO', status: 'OPEN NOW', latency: '6 MIN' },
  { id: 'dxb', name: 'CHICAGO // LOOP DOWNTOWN', code: 'CHI', status: 'OPEN NOW', latency: '7 MIN' },
  { id: 'zrh', name: 'MIAMI // CONVENTION CENTER', code: 'MIA', status: 'OPEN NOW', latency: '5 MIN' },
];
