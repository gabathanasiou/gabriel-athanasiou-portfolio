---
name: Airtable CMS Management
description: Understanding how data is fetched from Airtable and built statically.
---

# Airtable CMS Management Skill

This project uses **Airtable** as a Headless CMS.

## Architecture
1. The data is fetched via GitHub Actions (`sync-data.yml`) in the standalone **`gabriel-portfolio-data`** repository. This script makes a **single** API request to Airtable to fetch content for both portfolio modes (`directing` and `postproduction`), drastically saving API credits.
2. There is **no live fetching** from Airtable in the browser client. 
3. Static files (`portfolio-data.json`, `sitemap.xml`) are generated via the webhook action and pushed directly to the `main` branch of `gabriel-portfolio-data`.
4. The main frontend application (`gabriel-portfolio`) explicitly fetches these static data models dynamically using the blazing-fast **jsDelivr CDN** (e.g., `https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@main/directing/portfolio-data.json`).
5. Type definitions remain in `src/types.ts` for safety (e.g., `Project`, `BlogPost`, `HomeConfig`).

## Modifying Data Models
When the Airtable schema changes (a column is added/removed):
1. Update `src/types.ts` to include the new field across interfaces.
2. Update the sync logic inside `scripts/lib/sync-core.mjs` (the central parsing core) to map the new Airtable fields correctly to the exported JSON.
3. Update the required React views inside `src/components/views` or child components to render the new field.

## Triggering Data Sync
Data syncing from Airtable is strictly manual to prevent abuse limits.
This is triggered either through a Webhook emitted from Airtable directly to the `gabriel-portfolio-data` GitHub Action, or manually triggered via the `workflow_dispatch` trigger in that repository's Actions tab.
