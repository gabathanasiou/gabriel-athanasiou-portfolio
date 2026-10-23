# gabriel-portfolio — Agent Guide

> Canonical entry point for AI agents. Read this first. It is the always-loaded hub
> (keep it under ~200 lines); deeper detail lives in `AI_AGENT_GUIDE.md` and `docs/`.
> Last verified against the code: **2026-10-23**.

## What this repo is

The React frontend for three properties built from one codebase:

| Property | Mode | Domain |
|---|---|---|
| Directing portfolio | `directing` | directedbygabriel.com |
| Post-production portfolio | `postproduction` | lemonpost.studio |
| Instagram Studio | — | studio.lemonpost.studio (sub-app) |

It is a **static SPA**. Content is fetched at runtime from pre-built JSON on jsDelivr;
there is no Airtable or Cloudinary credential in the browser and no server-side data
layer. The pipeline that produces the JSON lives in the separate
[`gabriel-portfolio-data`](../gabriel-portfolio-data) repo.

Stack: React 19.2, Vite 6, React Router 7, TypeScript 5.8, Tailwind 3.4 (CDN),
Netlify (hosting + functions + edge function).

## Repo map

```
src/
  App.tsx                 routes and lazy view loading
  components/views/       page-level views (one per route)
  components/             shared UI (Navigation, Footer, SEO, OptimizedImage, …)
  services/               cmsService (jsDelivr fetch + cache), analytics
  utils/                  pure helpers; tests in utils/__tests__
  theme.ts                THEME design tokens (Tailwind class strings)
  types.ts                Project / BlogPost / HomeConfig contracts
netlify/
  functions/sitemap.js    serves the pre-built sitemap
  edge-functions/         Deno edge function (excluded from the root tsconfig)
scripts/                  build/deploy utilities and manual tools
scripts/instagram-studio/ separate React 18 app — its own package.json, lockfile, deploy
_agents/                  skills + workflows (read the matching one before the task)
docs/                     deployment, image optimisation, studio quick reference
```

## Commands

| Command | What it does |
|---|---|
| `npm install` | install dependencies |
| `npm run dev` | Netlify Dev, functions + Vite. Requires the Netlify CLI (not a dependency) |
| `npm run dev:vite` | Vite only, no functions |
| `npm run dev:directing` / `dev:postprod` | mode-specific Vite dev server |
| `npm run build` | plain Vite production build |
| `npm run build:directing` / `build:postprod` | mode-specific production build |
| `npm run preview` | serve the built `dist/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | unit tests once (Vitest) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | coverage report (V8) |
| `npm run verify` | `typecheck` + `test` — the default gate |
| `npm run instagram-studio` | run the sub-app dev server |
| `npm run instagram-studio:build` | build the sub-app |

There is **no lint or formatter yet**, and no CI. Do not claim a command exists
because a doc says so — check `package.json`.

## Verify before done

1. `npm run typecheck` — must be 0 errors.
2. `npm test` — must be green.
3. `npm run build:<mode>` for any route, component or style change.
4. For UI changes, run the dev server and look at the affected route in **both** modes
   when the change touches shared components.
5. Update the docs you invalidated (see the docs map below).

`npm run build` succeeding is **not** proof the app works — Vite does not typecheck and
there is no browser test layer.

## Data contract

- `src/services/cmsService.ts` reads `VITE_PORTFOLIO_MODE` (default `directing`) and
  fetches:
  `https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@data/<mode>/portfolio-data.json`
  with a 5-minute in-memory cache. If jsDelivr fails it tries `/<mode>/portfolio-data.json`
  and otherwise returns an empty state.
- The JSON shape is `{ projects, posts, config }`, typed in `src/types.ts`; the
  field-level mapping is `../gabriel-portfolio-data/docs/SCHEMA.md`.
- **Never fetch Airtable from React.** Content changes go through the data repo's sync
  (manual workflow dispatch or the Airtable repository dispatch).
- **Never hand-edit the `data` branch.** The data repo owns that procedure
  (`docs/MAINTENANCE.md`).

## Styling

- Tailwind 3.4 is loaded from the CDN in `index.html`, with the inline
  `tailwind.config` there. Utility classes are the layout layer.
- Shared design decisions (type scale, section padding, colours, animation timings)
  live in `src/theme.ts` as `THEME` class strings and CSS variables, applied globally
  by `src/components/GlobalStyles.tsx`.
- Use `THEME.*` for anything that should stay consistent across the site; use utilities
  for local layout. Do not add a second styling system or new CSS files for one-off
  components.
- Both portfolios share components; branch on `config.portfolioId` / the mode rather
  than forking a component.

## Deployment

- Netlify builds with `bash scripts/netlify-build.sh`; `PORTFOLIO_MODE` (or
  `VITE_PORTFOLIO_MODE`) selects the site. The script runs `npm ci`, the mode build,
  then writes `robots.txt`/`sitemap.xml` into `dist/` and fails if either is missing.
- `scripts/ignore-netlify-build.sh` skips builds on `main` unless the commit message
  contains `[deploy]` or `[force-deploy]` (or "Scheduled sync").
- **Never add `[deploy]` or `[force-deploy]` unless the user explicitly asks for a
  deployment.** "Push to main" is not a deployment request.
- The Instagram Studio deploys from `scripts/instagram-studio/` with its own Netlify
  config; do not mix its build with the root app.

## Security

- Never commit `.env*`. Use `.env.local` locally; production values live in Netlify
  environment variables. Never put a server secret in a `VITE_`-prefixed variable —
  those are bundled into the client.
- The data repo holds the Airtable and Cloudinary credentials. This repo only consumes
  published JSON and builds Cloudinary delivery URLs.
- `scripts/tests/` contains **manual tools**, not tests; several mutate Airtable or
  Cloudinary. Read a script before running it and never run one against production
  content without being asked.
- Treat every deploy and every credential/Netlify setting change as a production change.

## Testing

- `src/utils/__tests__/` holds the Vitest suite (41 tests). Both files cover shipped
  TypeScript: `markdown.test.ts` and `videoHelpers.test.mjs` (which imports
  `videoHelpers.ts` extensionless).
- Add tests for pure logic (parsing, slugs, video URLs, markdown/sanitisation) in the
  same folder, importing the `.ts` module from `src/`.
- No browser/e2e layer exists yet. A UI change is verified by running the app.
- Anything needing Airtable or Cloudinary is a manual check, not a unit test.

## Docs map

| Doc | Read it for |
|---|---|
| `AI_AGENT_GUIDE.md` | architecture deep dive, data flow, anti-patterns |
| `docs/DEPLOYMENT_GUIDE.md` | Netlify setup and domains |
| `docs/IMAGE_OPTIMIZATION.md` | Cloudinary URL building and image pipeline |
| `docs/INSTAGRAM_QUICK_REFERENCE.md` | the studio sub-app |
| `_agents/skills/dual-portfolio/` | mode-specific routing and filtering |
| `_agents/skills/theme-management/` | THEME usage |
| `_agents/skills/instagram-studio/` | studio boundaries and commands |
| `_agents/skills/game-implementation/` | the "Guess the Project" game |
| `_agents/workflows/` | component creation, styling, data edits |
| `../gabriel-portfolio-data/AGENTS.md` | the data pipeline, schema, publish and rollback |
| `../gabriel-portfolio-data/docs/SCHEMA.md` | Airtable → JSON field mapping |
| `../gabriel-portfolio-data/docs/MAINTENANCE.md` | sync triggers and the guarded hotfix procedure |

If two docs disagree, the code wins. Fix the doc in the same change.

## Conventions

- TypeScript, functional components, named exports for views; `React.FC<Props>` for
  page views. Types live in `src/types.ts` or beside the component.
- Prefer relative imports inside `src/` — the `@` aliases are configured but unused.
- Keep views under ~400 lines; extract subcomponents when a file grows.
- React Router 7 (`react-router-dom` 7.x), not 6.
- Small, revertible commits with imperative messages. Do not mix refactors with
  behaviour changes.
- One source of truth: update `AGENTS.md` / `AI_AGENT_GUIDE.md` / `docs/` when a change
  invalidates them; delete stale docs rather than leaving two answers.

## Known gaps (2026-10-23)

- No CI workflow and `main` is not protected. Run `npm run verify` locally.
- No lint/format configuration.
- The test suite covers two utility modules only; components and services are untested.
- `scripts/tests/` mixes debug tools with destructive production utilities.
- `scripts/instagram-studio/` is a separate app (React 18, own dependencies) inside a
  `scripts/` folder.
- The 2026-10-23 agentic-workflow audit in the data repo lists the full backlog:
  `../gabriel-portfolio-data/docs/audits/2026-10-23-agentic-workflow-audit.md`.

## Do not

- Do not fetch Airtable directly, read credentials in the client, or add a new data
  source.
- Do not edit the `data` branch, force-push `main`, or commit `.env*`.
- Do not deploy (or add a deploy marker) without an explicit request.
- Do not add a component library or second styling system without asking.
