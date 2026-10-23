# Architecture — Gabriel Portfolio

> **Read [`AGENTS.md`](./AGENTS.md) first.** That is the canonical agent guide (commands,
> verification, security, conventions). This file is the architecture deep dive.
> **Status:** verified against the code on 2026-10-23.

## Three properties, one codebase

1. **Directing portfolio** — `directedbygabriel.com`, `VITE_PORTFOLIO_MODE=directing`.
2. **Post-production portfolio** — `lemonpost.studio`, `VITE_PORTFOLIO_MODE=postproduction`.
3. **Instagram Studio** — `studio.lemonpost.studio`, a separate React 18 app in
   `scripts/instagram-studio/` with its own dependencies and Netlify config.

The first two share every component. Differences are driven by the mode/`portfolioId`
from the published config: navigation, filters, journal availability and role rules.

## Data flow

```
Airtable  →  gabriel-portfolio-data sync  →  data branch  →  jsDelivr  →  cmsService  →  React
```

- The **data repository** (`../gabriel-portfolio-data`) owns the Airtable and Cloudinary
  credentials, the schema mapping, the publish gate and the `data` branch. Its
  `AGENTS.md` and `docs/SCHEMA.md` are the source of truth for content.
- The frontend never calls Airtable. `src/services/cmsService.ts` fetches
  `<mode>/portfolio-data.json` from jsDelivr, caches it for five minutes in memory,
  falls back to `/<mode>/portfolio-data.json`, then to an empty state.
- The payload is `{ projects, posts, config }`; contracts live in `src/types.ts`.
- Images are served from Cloudinary. `src/utils/imageOptimization.ts` and
  `src/components/common/OptimizedImage.tsx` build delivery URLs (`q_auto,f_auto`);
  raw Airtable attachment URLs expire and must never reach the UI.

## Rendering

- `src/App.tsx` owns the routes: `/`, `/work`, `/work/:slug`, `/journal`,
  `/journal/:slug`, `/about`, `/game`, and the 404 fallback.
- Page views in `src/components/views/` are lazy-loaded with `React.lazy`; shared
  components live in `src/components/`.
- Two layers of styling:
  - **Tailwind 3.4** via the CDN script in `index.html` (with an inline config that
    maps CSS variables), used for local layout.
  - **`THEME`** in `src/theme.ts` — shared typography, spacing, colour and animation
    class strings — with CSS variables injected by `src/components/GlobalStyles.tsx`.
- `src/utils/markdown.ts` renders journal content and escapes/sanitises it before HTML
  insertion. Do not bypass it, and do not add a second Markdown renderer.

## Backend surface

- `netlify/functions/sitemap.js` serves the already-generated sitemap from jsDelivr.
- `netlify/edge-functions/meta-rewrite.ts` is a **Deno** edge function for share/meta
  tags. It is excluded from the root `tsconfig.json`; do not import it from `src/`.
- `scripts/netlify-build.sh` is the production build entry point. It installs, builds
  the selected mode, writes `robots.txt`/`sitemap.xml` into `dist/`, and fails the
  build if either is missing.

## Deployment

- Netlify builds one site per mode. `scripts/ignore-netlify-build.sh` skips builds on
  `main` unless the commit message contains `[deploy]`/`[force-deploy]` (or a scheduled
  sync). Never add those markers unless the user explicitly asks for a deployment.
- The Instagram Studio has its own `netlify.toml`, functions and deploy; keep its code
  and build inside `scripts/instagram-studio/`.

## Anti-patterns

- Fetching Airtable or holding provider secrets in React code.
- Hand-editing the `data` branch (the data repo has a guarded procedure).
- Duplicating shared components per portfolio instead of branching on mode.
- Adding a new styling system, component library or state manager without asking.
- Adding `[deploy]` to a commit because the change "seems ready".

## Historical context

`CHANGELOG.md` keeps the verbose history; `archive_docs/` holds retired planning docs.
Neither is a live guide — prefer `AGENTS.md`, `docs/` and the data repo's docs.
