---
name: Game Implementation
description: Details about the "Guess the Project" interactive mini-game.
---

# Game Implementation Skill

The mini-game is an interactive trivia feature implemented primarily in `src/components/views/GameView.tsx`. 
It challenges users to guess the project based on a random still frame from the filmography.

## Game Logic & Architecture
- **Location**: `/game` route.
- **Fetching**: It dynamically filters projects initialized in `App.tsx` that contain a populated `gallery` array.
- **Gameplay**: 
  - Shuffles a random gallery image.
  - Presents 3 multiple-choice options (1 correct, 2 randomly generated wrong answers).
  - Upon correctly guessing, the "Trading Card" UI flips to reveal the project metadata (Genre, Year, snippet) with a holographic shimmer.
- **State Management**: It uses `localStorage` (key: `game_highScore`) to persist the user's high score locally without a database.

## Maintenance Notes
- **Styling**: It is styled to mirror the site's sleek, dark aesthetic. Ensure you use `THEME` values for any card styling.
- **Media**: Ensure that `OptimizedImage.tsx` is used for the random gallery images. Loading raw images from Airtable will crash performance.
