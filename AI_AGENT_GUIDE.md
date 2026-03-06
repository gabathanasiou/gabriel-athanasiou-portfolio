# 🤖 Gabriel Athanasiou Portfolio: Master Agent Guide

**Purpose**: The central starting point for any AI agent interacting with this repository. 
**Status**: Revised March 2026.

This repository powers **three distinct properties** from a single codebase and Airtable CMS:
1. **Directing Portfolio** (`directedbygabriel.com`)
2. **Post-Production Portfolio** (`lemonpost.studio`)
3. **Instagram Studio App** (`studio.lemonpost.studio`)

## 🧠 AI Agent Skills & Workflows
To maintain a clean codebase, specialized logic and guides have been abstracted into `_agents/skills`. If you are tasked with any of the following, **you MUST read the corresponding skill file first**:

- **Airtable CMS**: `_agents/skills/airtable-cms/SKILL.md` (Understanding how data is fetched and built statically)
- **Cloudinary CDN**: `_agents/skills/cloudinary-maintenance/SKILL.md` (CDN proxying, caching, static hosting)
- **Dual Portfolio Architecture**: `_agents/skills/dual-portfolio/SKILL.md` (How one repo builds two sites)
- **Theme Management**: `_agents/skills/theme-management/SKILL.md` (Dealing with Tailwind CSS and global styling)
- **Instagram Studio**: `_agents/skills/instagram-studio/SKILL.md` (The dedicated guide for the Instagram application)
- **Game Implementation**: `_agents/skills/game-implementation/SKILL.md` (Details on the interactive 'Guess the Project' game)

## 🏗️ Core Architecture & Data Flow

### The Headless Data Repository
This project uses a **decoupled, headless data architecture**. The UI repository does **not** contain the logic for fetching data from Airtable or processing media. 

- **Data Repository**: [gabriel-portfolio-data](https://github.com/gabathanasiou/gabriel-portfolio-data)
- **Source Data Schema**: See **[SCHEMA.md](https://github.com/gabathanasiou/gabriel-portfolio-data/blob/main/docs/SCHEMA.md)** in the data repository for the complete Airtable field mapping and data structures.
- **Sync Pipeline**: A unified sync script in the data repo fetches all 5 Airtable tables once, syncs images to Cloudinary (cache-first), and generates the static JSON, Sitemap, and Robots.txt files.
- **Consumption**: The frontend dynamically requests these JSON files via the **jsDelivr CDN**.

See `_agents/skills/airtable-cms/SKILL.md` for the technical deep-dive into this flow.

### Media Delivery
The application never loads raw Airtable image URLs (they expire). Everything is synchronized to Cloudinary during the data sync process. The application utilizes `src/components/common/OptimizedImage.tsx` which constructs authorized the Cloudinary delivery URLs (`q_auto,f_auto`).

### The Technology Stack
- **Frontend**: React 19.2 + Vite + React Router 6. Everything uses TypeScript (`src/types.ts`).
- **Styling**: Vanilla CSS with custom design tokens in `src/theme.ts`. (Tailwind CSS has been removed/phased out in favor of the custom theme system).
- **Backend/CI**: Handled exclusively in the data repository.

## 🚀 Deployment & CI/CD
The project uses **Netlify** with environment variables dictating the mode. 
- **Directing Env**: `PORTFOLIO_MODE=directing` mapped to directedbygabriel.com
- **Post Prod Env**: `PORTFOLIO_MODE=postproduction` mapped to lemonpost.studio
- **Static Artifacts**: Generated data payloads like `sitemap.xml` and `portfolio-data.json` are uploaded straight to Cloudinary, bypassing Netlify CDN completely to ensure instantaneous cache propagation globally.

## 🗂️ Project Layout
- `src/theme.ts`: Global application configuration.
- `src/types.ts`: TypeScript contracts for the `Config`, `Project`, and `Post` entities.
- `src/components/views/*`: Complete page-level components conditionally loaded in `App.tsx`.
- `src/components/common/OptimizedImage.tsx`: The core wrapper component for rendering images appropriately processed through Cloudinary.
- `scripts/*`: A huge array of backend utilities supporting data syncing, test diagnostic environments, and the Instagram Studio app source code. 

## 🚫 Critical Anti-Patterns (DO NOT DO)
- **Do not fetch directly from Airtable from React code.**
- **Do not hardcode Tailwind utility classes on component roots** if they represent global branding configurations. Reference `THEME.[category].[property]`.
- **Do not duplicate global components**. When differentiating behavior between the two portfolios, write logic branching using `config.portfolioId` inside the existing shared components.

## 📜 History & Changelogs
The verbose project history and prior massive changelogs can be found in `CHANGELOG.md` at the root. 
- **Active Documentation**: Key guides for deployment and optimization are in `docs/`.
- **Archived Context**: Old planning docs and implementation logs are stored in `archive_docs/`.
- **Specialized Knowledge**: Deep dives into specific features are in `_agents/skills/`.