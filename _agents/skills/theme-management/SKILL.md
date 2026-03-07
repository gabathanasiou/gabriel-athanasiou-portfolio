---
name: Theme Management
description: Make sure to use this skill whenever updating global styling, layouts, animations, typography, or adding new tailwind classes to React components! Read this to understand the THEME.ts file.
---

# Theme Management Skill

This codebase enforces strict unified layout configurations, routing styles entirely through **Tailwind CSS** mapped to `src/theme.ts`.

## Core Thematic Principles
Do not use generic styles! Always import the global `THEME` object.
1. **Never** hardcode primitive tailwind margin classes directly (e.g., `mb-4`, `p-6`) onto components if they map to global padding behaviors.
2. Read the exported dictionary mapping to assign strings dynamically across elements.
3. If structural paddings or colors are missing inside React nodes, verify standardization inside `src/theme.ts` (e.g., `THEME.filmography.paddingTop`).
4. **No Custom CSS Modules**: Never use `styled-components` or external CSS sheets in UI templates!

## Consumption Example

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

## Creating Global Presets
When tasked to style new interface nodes gracefully:
1. Open the dictionary in `src/theme.ts`.
2. Find or establish the relevant structural section (`ui`, `blog`, `navigation`).
3. Construct complex structural variants inside a new object value using utility strings.
4. Distribute the preset consistently in children.
