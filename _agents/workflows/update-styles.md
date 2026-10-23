---
description: How to maintain and update the application styling
---

1. Open `src/theme.ts`.
2. Locate the property to change (colours, fonts, typography, hero variables, spacing).
3. Update the value or the Tailwind class string (e.g. `"bg-black"` → `"bg-gray-900"`).
4. Save. Vite HMR propagates the change to every component that consumes `THEME`.
5. Verify visually with `npm run dev:vite` (or `npm run dev` if you need Netlify
   functions) in both modes when the token is shared:
   `npm run dev:directing` / `npm run dev:postprod`.
6. Run `npm run typecheck` if you changed a typed export.
