/**
 * Pushes the 10 seed cars from `src/data/cars.seed.ts` into Sanity.
 *
 * Run this once against a fresh project, then never again: from that point the
 * Studio is the source of truth and the website reads published documents at
 * build time.
 *
 *   cd sanity && npm run seed
 *
 * Needs a write token (Sanity -> API -> Tokens), because it uploads the
 * exterior photography into the project's asset pipeline:
 *
 *   SANITY_STUDIO_PROJECT_ID=abc123
 *   SANITY_STUDIO_DATASET=production
 *   SANITY_API_TOKEN=sk-...
 */
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createClient } from '@sanity/client'

import { CARS } from '../../src/data/cars.seed.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')

for (const file of [resolve(root, '.env'), resolve(root, 'sanity/.env')]) {
  if (existsSync(file)) process.loadEnvFile(file)
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !token) {
  console.error(
    'Missing SANITY_STUDIO_PROJECT_ID and/or SANITY_API_TOKEN.\n' +
      'Create a write token at sanity.io/manage -> API -> Tokens, then add both to sanity/.env.',
  )
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-10-01', useCdn: false })

/** Uploads a remote exterior shot and returns a Sanity image reference. */
async function uploadImage(url, alt) {
  const asset = await client.assets.upload('image', url, {
    filename: url.split('/').pop().split('?')[0],
    contentType: 'image/jpeg',
  })
  return { _type: 'image', alt, asset: { _type: 'reference', _ref: asset._id } }
}

let created = 0
let updated = 0

for (const car of CARS) {
  const { imageUrl: hero, gallery: angles, ...rest } = car

  const image = await uploadImage(hero, `${car.name} — exterior view`)
  const galleryFields = await Promise.all(
    angles.map((angle) => uploadImage(angle.url, angle.alt)),
  )

  const doc = {
    _id: `car-${car.id}`,
    _type: 'car',
    ...rest,
    image,
    gallery: galleryFields,
  }

  const existing = await client.getDocument(doc._id)
  await client.createOrReplace(doc)
  existing ? updated++ : created++
  console.log(`  ${existing ? 'updated' : 'created'}  ${car.id}  ${car.name}`)
}

console.log(`\nDone. ${created} created, ${updated} updated in ${projectId}/${dataset}.`)
console.log('Now set PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET in the root .env and rebuild.')
