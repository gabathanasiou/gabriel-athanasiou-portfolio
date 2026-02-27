---
name: Cloudinary Sync & Maintenance
description: Understanding the Cloudinary integration, CDN caching, and syncing static files.
---

# Cloudinary Maintenance Skill

This project utilizes **Cloudinary** extensively as both a CDN for dynamic media and a host for static build artifacts.

## Architecture & Integration
1. **Dynamic Images**: When pulling from Airtable, URLs are rewritten to proxy through Cloudinary. This enables procedural optimizations, like swapping `q_auto,f_auto` presets based on user agent or network conditions.
2. **Static Asset Hosting**: Rather than relying purely on the hosting provider (Netlify) to serve the generated data files (`portfolio-data-directing.json`, `sitemap-directing.xml`, etc.), these are pushed directly to a Cloudinary bucket.

## Sync Flow (Static Upload)
The actual sync to Cloudinary happens during the GitHub Actions `Sync Data & Static Files` workflow:
1. Run `node scripts/sync-static-to-cloudinary.mjs`
2. It uploads the generated `.json` and `.xml` content from `public/` directly to Cloudinary.
3. If an explicit override is required because Cloudinary's cache is stale, use `--force`. (e.g., `node scripts/sync-static-to-cloudinary.mjs --force`).

## Maintenance Notes
- **Preset Issues**: If the preset configuration in `THEME.cloudinary` (`macro`, `ultra`, `hero`, etc) isn't matching, check `scripts/fix-cloudinary-preset.mjs` or `src/utils/cloudinary/urlBuilder.ts`.
- **Cache invalidation**: The project typically relies on the `--force` flag in the sync script to overwrite existing named assets in Cloudinary without changing their URL structure.
- **Environment Context**: Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are available in `.env.local` if attempting to run scripts like `sync-static-to-cloudinary.mjs` locally.
