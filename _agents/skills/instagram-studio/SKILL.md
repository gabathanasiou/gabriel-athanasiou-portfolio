---
name: Instagram Studio
description: Instructions for managing the companion Instagram Studio app.
---

# Instagram Studio Skill

The repository contains a separate sub-application for Instagram scheduling located in `scripts/instagram-studio/`. This is essentially an internal tool for Gabriel.

## Architecture
- It acts as a standalone tool deployed to `studio.lemonpost.studio`.
- Data is stored in the same Airtable base, but the Studio app organizes the content into a visual grid for social media scheduling.
- **De-duplication**: It leverages the same data fetched during the main sync to conserve API calls, utilizing the `gabriel-portfolio-data` repository's scheduled workflows.

## Local Development
Since it's a sub-app, it has its own `package.json` logic integrated into the top-level scripts.
- **Start the server**: `npm run instagram-studio`
- **Install dependencies**: `npm run instagram-studio:install`
- **Build**: `npm run instagram-studio:build`

If you are asked to modify the Instagram scheduling features, you will likely be working exclusively inside the `scripts/instagram-studio/` directory. Focus on that self-contained React environment rather than the primary portfolio Vite application in `src/`.
