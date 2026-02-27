---
name: Dual Portfolio Architecture
description: Explaining how the single codebase supports both the Directing (directedbygabriel.com) and Post-Production (lemonpost.studio) domains.
---

# Dual Portfolio Architecture Skill

This single codebase deploys **two separate portfolio websites** by leveraging environment variables and isolated build pipelines.

## The Two Profiles
1. **Directing** (`directedbygabriel.com`) 
   - Focused strictly on Directing work.
   - Has a Journal tab.
   - Netlify `PORTFOLIO_MODE=directing`
2. **Post-Production** / Lemon Post (`lemonpost.studio`) 
   - Focused on Color, Edit, and VFX.
   - No Journal tab but has a specialized role filter.
   - Netlify `PORTFOLIO_MODE=postproduction`

## How it works technically
The single truth of data is Airtable, but during the CI/CD sync phase (`npm run sync:both`), the sync logic loops through the two different `Portfolio ID` configuration rows defined in Airtable.
- A separate `portfolio-data-[mode].json` is generated for each.
- The `VITE_PORTFOLIO_MODE` environment variable is captured at build time (`npm run build:directing` vs `npm run build:postprod`) to tell the React application which JSON file it should fetch and render.

## Local Development
To run either site locally, use the specific npm scripts that inject the correct mode into Vite:
- `npm run dev:directing`
- `npm run dev:postprod`

*(Be sure your local `public/` folder contains populated JSON files by running `npm run sync:both` first!)*

## Testing changes
Before deploying a new feature (like a new component or routing setup), you must ensure it does not break the other portfolio. Both use the exact same React components (e.g. `App.tsx`, `IndexView.tsx`), but the properties passed to them change based on the active Config object from Airtable.
