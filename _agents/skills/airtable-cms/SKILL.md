---
name: Airtable CMS Management
description: Understanding how data is fetched from Airtable and built statically.
---

# Airtable CMS Management Skill

This project uses **Airtable** as a Headless CMS.

## Architecture
1. The data is fetched via GitHub Actions (`sync-data.yml`) in the standalone **`gabriel-portfolio-data`** repository. The sync script makes a **single** batch of 5 API calls to Airtable, fetching all tables in parallel and producing JSON files for both portfolio modes (`directing` and `postproduction`).
2. There is **no live fetching** from Airtable in the browser client. 
3. Static files (`portfolio-data.json`, `sitemap.xml`, `robots.txt`) are generated and pushed directly to the `main` branch of `gabriel-portfolio-data`.
4. The main frontend application (`gabriel-portfolio`) fetches these static data models dynamically using the **jsDelivr CDN** (e.g., `https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@main/directing/portfolio-data.json`).
5. Type definitions remain in `src/types.ts` for safety (e.g., `Project`, `BlogPost`, `HomeConfig`).

## Schema Reference
The full Airtable → Output field mapping is documented in **[SCHEMA.md](https://github.com/gabathanasiou/gabriel-portfolio-data/blob/main/docs/SCHEMA.md)** (Data Repo).
The raw Airtable base schema (fetched from the Metadata API) is at **[airtable-schema.json](https://github.com/gabathanasiou/gabriel-portfolio-data/blob/main/docs/airtable-schema.json)** (Data Repo).

## Sync Pipeline
The core sync logic lives in `gabriel-portfolio-data/scripts/lib/sync-logic.mjs`:
1. Fetch all 5 Airtable tables in parallel (Projects, Journal, Festivals, Client Book, Settings) — **5 API calls total**
2. Build lookup maps from Festivals and Client Book
3. Sync images to Cloudinary (check-then-upload, see `cloudinary-maintenance` skill)
4. For each portfolio mode:
   - Resolve config from Settings row matching `Portfolio ID`
   - Filter/transform projects (visibility, role filtering, owner credits, cross-site credits, gallery → Cloudinary URLs)
   - Filter/transform journal (only Published posts)
   - Write `{mode}/portfolio-data.json`
5. Separately: `generate-sitemap.mjs` and `generate-robots.mjs` read the generated JSON to produce `sitemap.xml` and `robots.txt`

## Modifying Data Models
When the Airtable schema changes (a column is added/removed):
1. Update `docs/SCHEMA.md` in `gabriel-portfolio-data` to document the new field
2. Update `scripts/lib/sync-logic.mjs` to map the new Airtable field to the output JSON
3. Update `src/types.ts` in `gabriel-portfolio` to include the new field across interfaces
4. Update the required React views inside `src/components/views` to render the new field

## Triggering Data Sync
Data syncing from Airtable is strictly manual to prevent abuse limits.
This is triggered either through a Webhook emitted from Airtable directly to the `gabriel-portfolio-data` GitHub Action, or manually triggered via the `workflow_dispatch` trigger in that repository's Actions tab.

## NPM Scripts
- `npm run sync:data` — Fetch from Airtable + write both portfolio JSONs (5 API calls)
- `npm run sync:sitemap` — Generate sitemaps for both modes
- `npm run sync:robots` — Generate robots.txt for both modes
- `npm run sync:all` — All of the above in sequence
