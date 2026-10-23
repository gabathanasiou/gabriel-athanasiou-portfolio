---
description: How to change production portfolio data safely
---

# Data Edit Workflow

Do **not** edit the published `data` branch directly and never run `git add .` there.
The data repository owns the guarded procedure.

1. **Normal content change:** edit the record in Airtable, then run the
   **"Sync Data & Static Files"** workflow in `gabriel-portfolio-data` (or dispatch
   `repository_dispatch: airtable-webhook-sync`).
2. **Emergency hotfix:** follow `../gabriel-portfolio-data/docs/MAINTENANCE.md` — a
   throwaway worktree, explicit artifact paths, and the `guard:data` check.
3. **Verify:** fetch `<mode>/portfolio-data.json` from the jsDelivr `@data` URL for both
   modes; purge the CDN only if a cache is stale.
4. **Never** commit secrets, `.env*`, `cloudinary-mapping.json` or non-artifact files to
   `data`.

See `../gabriel-portfolio-data/AGENTS.md` for the full publish and rollback contract.
