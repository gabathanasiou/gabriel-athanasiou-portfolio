# GitHub Copilot Instructions

The canonical guide is [`AGENTS.md`](../AGENTS.md). Read it before changing anything.

Quick rules:

- Verify with `npm run typecheck && npm test`; run a mode build for UI changes.
- **Never add `[deploy]` or `[force-deploy]`** unless the user explicitly asks for a
  deployment. "Push to main" is not a deployment request.
- Never fetch Airtable from React, hand-edit the `data` branch, or commit `.env*`.
- The command table lives in `AGENTS.md`; check `package.json` before trusting any doc.
