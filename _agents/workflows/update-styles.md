---
description: How to maintain and update the application styling
---

1. Open `src/theme.ts`.
2. Locate the specific property you want to change (colors, fonts, typography, hero variables, etc.).
3. Update the string containing the Tailwind utility class (e.g., change `"bg-black"` to `"bg-gray-900"`).
4. Save the file. The changes will instantly deploy across all components that consume `THEME`.
5. Run the dev server to visually verify:
// turbo
npm run dev
