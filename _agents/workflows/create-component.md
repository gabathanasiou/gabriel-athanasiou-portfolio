---
description: Create a new React Component following project standards
---

1. Create a new `.tsx` file inside `src/components/` (or `src/components/views/` if it is a new page route).
2. Create a functional React component and export it by name.
3. Import `THEME` from `theme.ts` for shared styling. `THEME.colors.*` are CSS colour
   values, not class names — use `THEME` class tokens for typography/spacing and inline
   styles only for raw values.
4. Keep components mostly presentational; put data fetching in `src/services/` and state
   in a hook or the parent view.
5. Add the component to `App.tsx` (route) or its parent layout, then run
   `npm run typecheck` and `npm test`.

Example:

```tsx
import React from 'react';
import { THEME } from '../theme';

interface MyNewComponentProps {
  title: string;
}

export const MyNewComponent: React.FC<MyNewComponentProps> = ({ title }) => {
  return (
    <div
      className={THEME.typography.body}
      style={{ backgroundColor: THEME.colors.background }}
    >
      {title}
    </div>
  );
};
```
