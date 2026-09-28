import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import { deskStructure } from './structure'

/**
 * KINETIC car-listing Studio.
 *
 * The site reads published `car` documents at build time via
 * `src/lib/cms/cars.ts`. Run `npm run dev` here to edit listings, then
 * `npm run seed` once to push the 10 seed cars from `src/data/cars.seed.ts`
 * into a fresh project.
 *
 * Set SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET in `sanity/.env` to
 * point the Studio at your project. The website reads the same project through
 * PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET in the root `.env`.
 */
export default defineConfig({
  name: 'kinetic-car-studio',
  title: 'KINETIC // Fleet Listings',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({ structure: deskStructure }), visionTool()],
  schema: { types: schemaTypes },
})
