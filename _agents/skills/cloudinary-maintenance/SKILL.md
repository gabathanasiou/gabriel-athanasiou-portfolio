---
name: Cloudinary Sync & Maintenance
description: Understanding the Cloudinary integration, CDN caching, and syncing static files.
---

# Cloudinary Maintenance Skill

This project utilizes **Cloudinary** extensively as both a CDN for dynamic media and a host for static build artifacts.

## Architecture & Integration
1. **Dynamic Images**: When pulling from Airtable, URLs are rewritten to proxy through Cloudinary. This enables procedural optimizations, like swapping `q_auto,f_auto` presets based on user agent or network conditions.
2. **Static Asset Hosting**: Rather than relying purely on the hosting provider (Netlify) to serve the generated data files (`portfolio-data-directing.json`, `sitemap-directing.xml`, etc.), these are pushed directly to a Cloudinary bucket.

## Sync Flow (Image Upload)
The actual sync to Cloudinary now happens during the GitHub Actions workflow inside the **`gabriel-portfolio-data`** repository:
1. When triggered by Airtable Webhook, the `gabriel-portfolio-data` script pulls all image IDs and sizes.
2. It uploads any newly detected images directly to Cloudinary.
3. The generated `.json` and `.xml` data models no longer live in Cloudinary, but rather the `main` branch of `gabriel-portfolio-data` directly to be served via the jsDelivr CDN.

## Maintenance Notes
- **Preset Issues**: If the preset configuration in `THEME.cloudinary` (`macro`, `ultra`, `hero`, etc) isn't matching, check `src/utils/cloudinary/urlBuilder.ts`.
- **Environment Context**: Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are available in `.env.local` if attempting to run sync scripts from the `gabriel-portfolio-data` repository locally.
