---
name: Instagram Studio
description: Make sure to use this skill whenever the user asks to modify the companion Instagram Studio app, fix the scheduling grid, run the local studio server, or modify anything inside the scripts/instagram-studio directory!
---

# Instagram Studio Skill

Gabriel utilizes an internal React companion scheduling application deployed to `studio.lemonpost.studio`, located entirely within `scripts/instagram-studio/` in the main portfolio repository. 

## Architectural Separation
- Do not mix portfolio Vite code `src/` with the studio companion logic! Modifications referencing Instagram features are self-contained here.
- De-duplication: The application queries identical static jsDelivr JSON configurations built by the `gabriel-portfolio-data` sync pipeline to generate social grids, preventing repeated API queries directly from Airtable.

## Running the Application
The studio is initialized via standard Node processes integrated at the top level:

- `npm run instagram-studio` – Launches the standalone dev server.
- `npm run instagram-studio:install` – Sets up the studio `package.json` logic.
- `npm run instagram-studio:build` – Initiates the production build inside `scripts/instagram-studio/dist/`.

Always assume you must navigate inside `scripts/instagram-studio/src/` to update internal grid UIs. Do not attempt to mount the studio components inside the global Directing frontend, as they are securely partitioned offline tools.
