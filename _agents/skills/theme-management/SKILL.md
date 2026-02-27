---
name: Theme Management
description: Managing global styling, layout, animations, and typography via the THEME.ts file.
---

# Theme Management Skill

This project uses a unified theme configuration in `src/theme.ts` paired with **Tailwind CSS**.

## Principles
1. **No direct tailwind classes on individual components if they represent global properties (like colors or font families)**.
2. All global styling properties MUST be referenced from `THEME` object exported from `src/theme.ts`.
3. If a component needs a specific margin, verify if it can be standardized inside `theme.ts` (e.g., `THEME.filmography.paddingTop`).

## How to use `THEME.ts`
When creating or updating a component:

```tsx
import { THEME } from '../theme';

export function MyComponent() {
  return (
    <div className={`w-full ${THEME.colors.background} ${THEME.typography.body}`}>
      <h1 className={THEME.typography.h1}>Hello World</h1>
    </div>
  );
}
```

## Adding new theme properties
If a new specific UI element needs styling configurations globally:
1. Open `src/theme.ts`.
2. Find the relevant context (e.g., `ui`, `blog`, `filmography`).
3. Add the Tailwind utility class strings to a new key.
4. Export and consume it in your React components.

**Do not** use plain CSS or CSS modules. **Do not** use styled-components.
