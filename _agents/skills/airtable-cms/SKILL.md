---
name: Airtable CMS Management
description: Understanding how data is fetched from Airtable and built statically.
---

# Airtable CMS Management Skill

This project uses **Airtable** as a Headless CMS.

## Architecture
1. The data is fetched via GitHub Actions (e.g., `sync-data.yml`) calling `npm run sync:both`. This script makes a **single** API request to Airtable to fetch content for both portfolio modes (`directing` and `postproduction`), drastically saving API credits.
2. There is **no live fetching** from Airtable in the browser client. 
3. Static files (`portfolio-data-directing.json`, `portfolio-data-postproduction.json`) are generated at build-time.
4. Data is stored in `src/types.ts` for typings (e.g., `Project`, `BlogPost`, `HomeConfig`).
5. After generation, the GitHub Action commits these JSON objects directly back into the repository `public/` folder, and syncs them to Cloudinary.

## Modifying Data Models
When the Airtable schema changes (a column is added/removed):
1. Update `src/types.ts` to include the new field across interfaces.
2. Update the sync logic inside `scripts/lib/sync-core.mjs` (the central parsing core) to map the new Airtable fields correctly to the exported JSON.
3. Update the required React views inside `src/components/views` or child components to render the new field.

## Triggering Data Sync
Data syncing from Airtable is strictly manual to prevent abuse limits.
Run `npm run sync:both` locally, or through GitHub Actions using the manual `workflow_dispatch` trigger.
