# gabriel-portfolio — Roadmap Archive (Completed Index)

Status: **index only** — the live backlog is `docs/ROADMAP.md`; consult this file
during triage (grep it before asking for or implementing anything). Full narrative
lives in git history (the commit that retired the item); canonical knowledge lives
in `AGENTS.md` / `docs/*.md` and the pointers below.

How to use: grep for a feature term before asking for or implementing anything. If it
hits, the work is done — read the pointers, don't re-implement. **Ids are stable:
never renumber or reuse.**

| # | Item | Knowledge / code pointers |
|---|---|---|

| # | Item | Knowledge / code pointers |
|---|---|---|
| 1 | Compile Tailwind at build time, drop the Play CDN | tailwind.config.js, postcss.config.js, src/index.css, index.html, vite.config.ts |
| 2 | Fix LCP and image/font delivery | src/utils/imageOptimization.ts (getCloudinarySrcSet, f_auto), src/components/common/OptimizedImage.tsx, HomeView.tsx, vite.config.ts font links |
| 3 | Accessibility and theming pass | src/styles/animations.css, theme-overrides.css, HomeView.tsx, ProjectDetailView.tsx (native dialog), VideoEmbed.tsx, index.html |
| 4 | Modern platform sweep from `legacy-scan` | src/styles/animations.css, game.css, GameView.tsx, IndexView.tsx, wall-editor.html, scripts/instagram-studio/src |
| 5 | Security and metadata hygiene | netlify.toml, vite.config.ts, index.html, tsconfig.json |
