---
name: Dual Portfolio Architecture
description: Make sure to use this skill whenever working on environment variables, routing between Directing vs Post-Production profiles, handling netlify deployment modes, or modifying global App.tsx configuration!
---

# Dual Portfolio Architecture Skill

This single codebase deploys **two separate portfolio websites** leveraging identical React components but isolated pipelines and environments. 

## The Profiles
You must respect the specific aesthetic context based on the current mode:

1. **Directing** (`directedbygabriel.com`)
   - Directing portfolio work.
   - Includes Journal routing.
   - Uses `PORTFOLIO_MODE=directing`.
2. **Post-Production** (`lemonpost.studio`)
   - Edit, Color, and VFX work.
   - Restricts Journal tab; filters strictly by role criteria.
   - Uses `PORTFOLIO_MODE=postproduction`.

## Technical Operations
The source of data is identical (Airtable), but the `gabriel-portfolio-data` sync phase splits out two JSON configuration files `portfolio-data-[mode].json` by pivoting the `Portfolio ID` configuration row.
When building or deploying the main UI `gabriel-portfolio`, the React Vite process grabs the `VITE_PORTFOLIO_MODE` environment variable. The app conditionally fetches the correct config endpoint from jsDelivr, toggling all navigation links, layout logic, and filter rules seamlessly (`App.tsx`, `IndexView.tsx`).

Always test your component mutations natively in both environments:
- Local Directing: `npm run dev:directing`
- Local Lemon Post: `npm run dev:postprod`

When generating or editing components, ensure that you always verify conditional structures. Do not assume all modes have access to Journal endpoints or routing setups!
