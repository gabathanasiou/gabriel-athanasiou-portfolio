---
name: Game Implementation
description: Make sure to use this skill whenever the user mentions the trivia game, 'Guess the Project', gallery image randomization, or the GameView.tsx component!
---

# Game Implementation Skill

This app features "Guess the Project," located in `src/components/views/GameView.tsx`. This interactive game challenges visitors to select the correct film title from a random frame pulled from Airtable gallery records, offering a playful method to engage the user's attention.

## Architecture & Implementation Requirements

### Route Loading
- Component renders on the `/game` route.
- Filters global `App.tsx` project state (already loaded) to exclude records missing a valid `gallery` array.

### Presentation Logic
- Retrieve and randomize 1 primary gallery image frame per round.
- Generate 3 total multiple-choice title buttons: 1 identical correct film array matches the frame's ID, and 2 distinct randomized incorrect titles.

### Win State & Rendering
- On correct interactions, toggle the "Trading Card" animation UI state (`GameView` logic).
- Flip the image frame to reveal project metadata text (e.g., Genre, Year, short Snippet).
- Append a subtle holographic CSS shimmer (holographic styles defined globally in `THEME.ts`).

### Data Persistence
- Maintain simple progress using the browser's `localStorage` (`game_highScore` key), bypassing any backend database needs.

## Style Enforcement
- You must always apply classes via `THEME.ts` context when building the card elements, matching the minimal deep-dark portfolio aesthetic. 
- You must wrap random images inside the `OptimizedImage.tsx` component, preventing unoptimized blob payloads from killing the client's frame rate.
