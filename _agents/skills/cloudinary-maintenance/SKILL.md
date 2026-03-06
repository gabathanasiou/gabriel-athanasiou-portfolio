---
name: Cloudinary Sync & Maintenance
description: Understanding the Cloudinary integration, CDN caching, and syncing static files.
---

# Cloudinary Maintenance Skill

This project utilizes **Cloudinary** as a CDN for dynamic media (portfolio images).

## Architecture & Integration
1. **Dynamic Images**: Airtable gallery images are uploaded to Cloudinary during the data sync. Frontend URLs are rewritten to proxy through Cloudinary, enabling on-demand optimizations (`q_auto,f_auto` presets based on user agent or network conditions).
2. **Static Data**: The generated `.json`, `.xml`, and `.txt` files live in the `main` branch of `gabriel-portfolio-data` and are served via the jsDelivr CDN (not Cloudinary).

## Sync Flow (Image Upload)

The sync happens via `scripts/lib/sync-logic.mjs` in the **`gabriel-portfolio-data`** repository.

### Cache-First Strategy
The sync uses a **cache-first approach** to avoid slow Cloudinary API checks:

1. Load `cloudinary-mapping.json` — a local cache of `publicId + airtableId → cloudinaryUrl`
2. For each Airtable attachment:
   - **Cache hit** (same publicId + airtableId in mapping) → reuse instantly, **zero API calls**
   - **Cache miss** → check Cloudinary API via `checkImageExists(publicId)`
     - If exists → use existing URL
     - If not → upload via `uploadToCloudinary(airtableUrl, publicId)`
3. Save updated `cloudinary-mapping.json`

This means unchanged content syncs with **0 Cloudinary API calls** (~5 seconds total).

### Public ID Convention
- Projects: `portfolio-projects-{airtableRecordId}-{galleryIndex}`
- Journal: `portfolio-journal-{airtableRecordId}`

## Maintenance Notes
- **Preset Issues**: If the preset configuration in `THEME.cloudinary` (`macro`, `ultra`, `hero`, etc) isn't matching, check `src/utils/cloudinary/urlBuilder.ts`.
- **Environment Context**: Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `USE_CLOUDINARY=true` are available in `.env.local` if running sync scripts locally from `gabriel-portfolio-data`.
- **Force re-upload**: Delete `cloudinary-mapping.json` to force the sync to re-check every image against the Cloudinary API.
