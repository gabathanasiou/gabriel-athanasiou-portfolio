# Gabriel Athanasiou — Portfolio Frontend

React + Vite frontend for three properties: **directedbygabriel.com** (directing),
**lemonpost.studio** (post-production) and **studio.lemonpost.studio** (Instagram
Studio). Content is published as static JSON by the separate
[`gabriel-portfolio-data`](https://github.com/gabathanasiou/gabriel-portfolio-data)
repository and fetched at runtime from the jsDelivr CDN.

**AI agents:** read [`AGENTS.md`](./AGENTS.md) first. It is the canonical guide for
commands, verification, architecture and security.

## Quick start

```bash
npm install

# Vite only (no Netlify functions)
npm run dev:vite

# Or pick a portfolio mode
npm run dev:directing      # directedbygabriel.com data
npm run dev:postprod       # lemonpost.studio data

# Netlify Dev (functions + edge routing); requires the Netlify CLI
npm run dev
```

`npm run dev` calls `netlify dev`; the CLI is not a local dependency. If it is not
installed, use `npm run dev:vite`.

## Verify

```bash
npm run typecheck   # tsc --noEmit
npm test            # Vitest, single run
npm run verify      # typecheck + test
npm run build:directing   # production build for one site
```

There is no CI yet; run `npm run verify` before calling a change done.

## Architecture

```
Airtable → gabriel-portfolio-data sync → data branch → jsDelivr → cmsService → React
```

- The frontend never talks to Airtable and holds no provider secrets.
- `src/services/cmsService.ts` fetches `<mode>/portfolio-data.json`, caches it for five
  minutes, and falls back to `/<mode>/portfolio-data.json`.
- Data contracts live in `src/types.ts`; the field mapping is documented in the data
  repo's `docs/SCHEMA.md`.
- Images are delivered through Cloudinary (`src/utils/imageOptimization.ts`,
  `src/components/common/OptimizedImage.tsx`); Airtable attachment URLs expire.
- The Instagram Studio is a separate React 18 app in `scripts/instagram-studio/` with
  its own dependencies and Netlify config.

Two styling layers: Tailwind 3.4 via the CDN script in `index.html` for local layout,
and the `THEME` tokens in `src/theme.ts` (CSS variables applied by
`src/components/GlobalStyles.tsx`) for shared design decisions.

## Environment variables

Create `.env.local` (never commit it):

```bash
VITE_PORTFOLIO_MODE=directing        # directing | postproduction
VITE_CLOUDINARY_CLOUD_NAME=your_cloud # optional; defaults to the production cloud
```

Airtable and Cloudinary credentials belong to the data repository and Netlify, not to
this app.

## Documentation

| Doc | What it covers |
|---|---|
| [`AGENTS.md`](./AGENTS.md) | canonical agent guide — start here |
| [`AI_AGENT_GUIDE.md`](./AI_AGENT_GUIDE.md) | architecture deep dive |
| [`docs/DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md) | Netlify setup and domains |
| [`docs/IMAGE_OPTIMIZATION.md`](./docs/IMAGE_OPTIMIZATION.md) | Cloudinary image pipeline |
| [`docs/INSTAGRAM_QUICK_REFERENCE.md`](./docs/INSTAGRAM_QUICK_REFERENCE.md) | the studio sub-app |
| [`_agents/skills/`](./_agents/skills) | task-specific skills (dual portfolio, theme, game, studio) |
| [`_agents/workflows/`](./_agents/workflows) | component, styling and data-edit workflows |
| [`archive_docs/`](./archive_docs) | retired plans and implementation logs — historical only |
| [`CHANGELOG.md`](./CHANGELOG.md) | verbose project history |

## Tech stack

- React 19.2 + TypeScript 5.8
- Vite 6 + React Router 7
- Tailwind CSS 3.4 (CDN) + `THEME` design tokens
- Netlify hosting, functions and edge function
- Cloudinary image delivery
- Vitest (unit tests)

## License

Private project.
