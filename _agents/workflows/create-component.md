---
description: Create a new React Component following project standards
---

1. Create a new `.tsx` file inside `src/components/` (or `src/components/views/` if it's a new page route).
2. Create a functional React component.
3. Import the `THEME` object from `theme.ts` if styling is required.
4. If the component interacts with logic, delegate state management or data fetching upstream or to custom hooks, keeping the component mostly presentational.
5. Export the component for use.

Example:
```tsx
import React from 'react';
import { THEME } from '../theme';

interface MyNewComponentProps {
  title: string;
}

export const MyNewComponent: React.FC<MyNewComponentProps> = ({ title }) => {
  return (
    <div className={`${THEME.colors.background} ${THEME.typography.body}`}>
      {title}
    </div>
  );
}
```
6. Add the component to the main `App.tsx` or its parent layout.
