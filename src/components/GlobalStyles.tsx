import React, { useEffect } from 'react';
import { THEME } from '../theme';
import { HomeConfig } from '../types';

// Import refactored CSS files
import '../styles/theme-overrides.css';
import '../styles/animations.css';
import '../styles/game.css';

interface GlobalStylesProps {
  config?: HomeConfig;
}

// The portfolio mode is baked in at build time, so the theme is correct even if
// the CMS fetch fails. config.portfolioId still wins when present.
const BUILD_MODE = import.meta.env.VITE_PORTFOLIO_MODE === 'postproduction'
  ? 'postproduction'
  : 'directing';

/**
 * Applies the settings from theme.ts as CSS Custom Properties (Variables).
 * Handles custom font loading and theme token switching.
 *
 * Default typefaces and colour tokens are set in src/index.css at build time;
 * this component only overrides them for CMS-configured custom fonts.
 */
export const GlobalStyles: React.FC<GlobalStylesProps> = ({ config }) => {
  const portfolioId = config?.portfolioId || BUILD_MODE;
  const isPostProduction = portfolioId === 'postproduction';

  // Load a custom font only when the CMS asks for one; defaults ship in the CSS.
  useEffect(() => {
    const root = document.documentElement;

    if (isPostProduction) {
      root.style.setProperty('--font-sans', '"DM Sans", system-ui, sans-serif');
      root.style.setProperty('--font-serif', '"Outfit", system-ui, sans-serif');
      root.style.setProperty('--font-portfolio', '"DM Sans"');
      return;
    }

    const customFont = config?.fontFamily;
    if (customFont && customFont !== 'Inter') {
      const fontQuery = customFont.replace(/ /g, '+');
      if (!document.querySelector(`link[href*="${fontQuery}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }

      root.style.setProperty('--font-sans', `"${customFont}", system-ui, sans-serif`);
      root.style.setProperty('--font-portfolio', `"${customFont}"`);
    } else {
      root.style.setProperty('--font-sans', THEME.fonts.sans);
      root.style.setProperty('--font-serif', THEME.fonts.serif);
      root.style.setProperty('--font-portfolio', THEME.fonts.sans);
    }
  }, [config?.fontFamily, isPostProduction]);

  // Apply theme mode & selection colors
  useEffect(() => {
    const root = document.documentElement;

    if (isPostProduction) {
      root.style.setProperty('--color-bg-main', '#ffffff');
      root.style.setProperty('--color-text-main', '#1a1a1a');
      root.style.setProperty('--color-text-muted', '#666666');
      root.style.setProperty('--color-selection', 'rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--color-selection-text', '#1a1a1a');
      root.style.setProperty('--color-line', 'rgba(0, 0, 0, 0.10)');
      root.style.setProperty('--brand-logo-filter', 'brightness(0)');
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.style.setProperty('--color-bg-main', THEME.colors.background);
      root.style.setProperty('--color-text-main', THEME.colors.textMain);
      root.style.setProperty('--color-text-muted', THEME.colors.textMuted);
      root.style.setProperty('--color-selection', THEME.colors.selectionBg);
      root.style.setProperty('--color-selection-text', THEME.colors.textMain);
      root.style.setProperty('--color-line', 'rgba(255, 255, 255, 0.10)');
      root.style.setProperty('--brand-logo-filter', 'brightness(0) invert(1)');
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
  }, [isPostProduction]);

  return null;
};
