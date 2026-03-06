# Final Data Repository Migration Plan

Migrating from storing Airtable JSON data in Cloudinary to a dedicated GitHub repository (`gabathanasiou/gabriel-portfolio-data`). This new repository will store all JSON data, including Instagram Studio data, Sitemaps, and Robots.txt, and serve it blazingly fast via the jsDelivr CDN. 

The new repository will be completely self-contained. The scripts that fetch from Airtable and the GitHub Action that runs the sync will be bodily moved from `gabriel-portfolio` **into** `gabriel-portfolio-data`.

**Critical Architecture Update:** As discussed, we are removing the complex "Incremental Sync" Airtable logic. The new script will fetch the **full** raw Airtable data every single time, saving API complexities and natively relying on Git to highlight diffs and changes over time.

## Proposed Architecture & Folder Structure

The new `gabriel-portfolio-data` repository will serve as the "backend logic" for the CMS, running its own Github Actions, and storing the built files:

```
gabriel-portfolio-data/
├── .github/
│   └── workflows/
│       └── sync-data.yml        <-- Action moved here!
├── scripts/
│   ├── sync-data.mjs            <-- Core syncing scripts moved here!
│   ├── generate-sitemap.mjs     <-- Static generation moved here!
│   ├── generate-robots.mjs      <-- Static generation moved here!
│   ├── upload-instagram-data.mjs
│   └── lib/
│       ├── sync-core.mjs        <-- Updated to force FULL SYNC
│       └── airtable-helpers.mjs <-- Incremental timestamp checks removed
├── package.json                 <-- Dependencies needed for sync
├── directing/
│   ├── portfolio-data.json      <-- Generated data outputs
│   ├── sitemap.xml
│   └── robots.txt               <-- Site-specific robots.txt
├── postproduction/
│   ├── portfolio-data.json
│   ├── sitemap.xml
│   └── robots.txt               <-- Site-specific robots.txt
├── instagram-studio/
│   └── studio-data.json
└── README.md
```

## Phase 1: Moving Logic to `gabriel-portfolio-data`
Clone `https://github.com/gabathanasiou/gabriel-portfolio-data.git` locally alongside the main project.
Initialize a `package.json` for the syncing dependencies (e.g., `dotenv`, `node-fetch`, etc), and migrate the required generator scripts over.

### [MODIFY] `scripts/lib/sync-core.mjs` (In New Repo)
Refactor the core sync logic to permanently bypass timestamp/change detection. We will default `forceFullSync` to true, and safely remove the ~100 lines of complex incremental caching logic.

### [MODIFY] `scripts/lib/airtable-helpers.mjs` (In New Repo)
Delete the `fetchTimestamps`, `checkForChanges`, and `fetchChangedRecords` functions. Keep only the full table fetching and normalization utilities.

### [MODIFY] Generator Scripts (In New Repo)
Update `sync-data.mjs`, `generate-sitemap.mjs`, and `generate-robots.mjs` so instead of outputting to `../public/`, they output to the structured `directing/`, `postproduction/`, and `instagram-studio/` folders in their own root directory.

## Phase 2: Connecting the Frontend Application (`gabriel-portfolio`)

### [MODIFY] `src/services/cmsService.ts`
Update to fetch data dynamically from the jsDelivr CDN instead of the local public folder:
- Directing: `https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@main/directing/portfolio-data.json`
- Post-Production: `https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@main/postproduction/portfolio-data.json`

### [NEW] `public/_redirects` or `netlify.toml`
Set up Netlify proxies to seamlessly serve the static files from the new data repository under the main domain name:
```
/sitemap.xml    https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@main/:mode/sitemap.xml   200
/robots.txt     https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@main/:mode/robots.txt    200
```
*(Note: We will dynamically route the `/sitemap.xml` proxy based on the `PORTFOLIO_MODE` environment variable).*

## Phase 3: Cleaning up `gabriel-portfolio` (Main Repo)

Delete the moved generation scripts from the clean frontend repository:
#### [DELETE] `.github/workflows/sync-data.yml`
#### [DELETE] `scripts/sync-static-to-cloudinary.mjs`
#### [DELETE] `scripts/generate-sitemap.mjs`
#### [DELETE] `scripts/generate-robots.mjs`
#### [DELETE] `scripts/lib/sync-core.mjs` (and related Airtable syncing scripts)

### [MODIFY] Documentation
Update the corresponding SKILL markdown files (`airtable-cms`, `cloudinary-maintenance`, `instagram-studio`) to reflect the new external Data Repository Architecture.
