import { defineField, defineType } from 'sanity'

/**
 * The `car` document type. Field names match the `Car` interface in
 * `src/types.ts` and the GROQ projection in `src/lib/cms/cars.ts`, so an
 * editor filling this form in the Studio is filling the exact shape the site
 * renders. Nothing needs translating in between.
 */
export const car = defineType({
  name: 'car',
  title: 'Car',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'specs', title: 'Specs & Rate' },
    { name: 'media', title: 'Photography' },
    { name: 'availability', title: 'Availability' },
  ],
  fields: [
    defineField({
      name: 'code',
      title: 'Car ID',
      type: 'string',
      group: 'identity',
      description: 'Short fleet code shown on cards, e.g. KC-VLK-01. Must be unique.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Display name',
      type: 'string',
      group: 'identity',
      description: 'Uppercase marketing name, e.g. VELOCE GT-R.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'identity',
      options: { source: 'name', maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'make',
      title: 'Make',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'model',
      title: 'Model',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'band',
      title: 'Class band',
      type: 'string',
      group: 'identity',
      description: 'Short class tag rendered next to the name, e.g. S-SPORT.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'identity',
      description: 'Drives the fleet matrix filter tabs.',
      options: {
        list: [
          { title: 'Electric', value: 'ev' },
          { title: 'Hybrid SUV', value: 'hybrid' },
          { title: 'Sports Coupe', value: 'quad' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'statusBadge',
      title: 'Status badge',
      type: 'string',
      group: 'availability',
      description: 'Uppercase status text, e.g. [AVAILABLE // NYC].',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'statusTone',
      title: 'Status tone',
      type: 'string',
      group: 'availability',
      options: {
        list: [
          { title: 'Orange (available)', value: 'orange' },
          { title: 'Muted (low stock)', value: 'muted' },
        ],
        layout: 'radio',
      },
      initialValue: 'orange',
    }),
    defineField({
      name: 'available',
      title: 'Bookable',
      type: 'boolean',
      group: 'availability',
      description: 'Unbookable cars still appear on the fleet pages but are hidden from the booking picker.',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'availability',
      initialValue: false,
    }),
    defineField({
      name: 'hubs',
      title: 'Pickup hubs',
      type: 'array',
      group: 'availability',
      description: 'Hub codes from HUBS in src/data/fleetData.ts.',
      of: [{ type: 'string' }],
      options: { list: ['nyc', 'lon', 'tyo', 'dxb', 'zrh'] },
    }),

    defineField({
      name: 'desc',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'identity',
      validation: (rule) => rule.required().max(280),
    }),
    defineField({ name: 'chassis', title: 'Chassis badge', type: 'string', group: 'identity' }),
    defineField({
      name: 'rigLabel',
      title: 'Included badge',
      type: 'string',
      group: 'identity',
      description: 'Short "what is included" line rendered on the image overlay.',
    }),

    defineField({
      name: 'power',
      title: 'Power',
      type: 'number',
      group: 'specs',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({ name: 'powerUnit', title: 'Power unit', type: 'string', group: 'specs', initialValue: 'HP' }),
    defineField({
      name: 'zeroToSixty',
      title: '0-60 (seconds)',
      type: 'number',
      group: 'specs',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({ name: 'drive', title: 'Drive', type: 'string', group: 'specs', initialValue: 'RWD' }),
    defineField({ name: 'driveSub', title: 'Drive sub-label', type: 'string', group: 'specs' }),
    defineField({
      name: 'pricePer24h',
      title: 'Rate per 24h (USD)',
      type: 'number',
      group: 'specs',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({ name: 'seats', title: 'Seats', type: 'number', group: 'specs' }),
    defineField({ name: 'luggage', title: 'Luggage capacity', type: 'number', group: 'specs' }),
    defineField({ name: 'transmission', title: 'Transmission', type: 'string', group: 'specs' }),
    defineField({ name: 'fuel', title: 'Fuel / power', type: 'string', group: 'specs' }),
    defineField({ name: 'range', title: 'Range', type: 'string', group: 'specs' }),
    defineField({ name: 'topSpeed', title: 'Top speed (mph)', type: 'number', group: 'specs' }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      group: 'specs',
      description: 'Lower numbers appear first in the fleet matrix.',
      initialValue: 100,
    }),

    defineField({
      name: 'image',
      title: 'Hero image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      description: 'The exterior shot used on cards. Portrait crops better for the wheel.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the exterior view for screen readers.',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'media',
      description: 'Additional exterior angles for the rotating fleet wheel.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'code', media: 'image', price: 'pricePer24h' },
    prepare({ title, subtitle, media, price }) {
      return {
        title,
        subtitle: `${subtitle ?? 'NO CODE'} — $${price ?? 0}/24h`,
        media,
      }
    },
  },
})
