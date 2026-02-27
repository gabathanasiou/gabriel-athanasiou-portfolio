
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

/**
 * Applies the settings from theme.ts as CSS Custom Properties (Variables).
 * Handles dynamic font loading and theme mode switching.
 */
export const GlobalStyles: React.FC<GlobalStylesProps> = ({ config }) => {
  // Load custom fonts based on portfolio type
  useEffect(() => {
    const isPostProduction = config?.portfolioId === 'postproduction';
    const root = document.documentElement;

    if (isPostProduction) {
      // Premium font pairing for Lemon Post Studio
      const fontsToLoad = [
        { name: 'Outfit', weights: '300;400;500;600;700' },
        { name: 'DM Sans', weights: '300;400;500;600;700' }
      ];

      fontsToLoad.forEach(font => {
        const fontQuery = font.name.replace(/ /g, '+');
        if (!document.querySelector(`link[href*="${fontQuery}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@${font.weights}&display=swap`;
          document.head.appendChild(link);
        }
      });

      root.style.setProperty('--font-sans', '"DM Sans", system-ui, sans-serif');
      root.style.setProperty('--font-serif', '"Outfit", system-ui, sans-serif');
      root.style.setProperty('--font-portfolio', '"DM Sans"');
    } else {
      // Custom font from config for other portfolios
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
        // Fallback to theme defaults
        root.style.setProperty('--font-sans', THEME.fonts.sans);
        root.style.setProperty('--font-serif', THEME.fonts.serif);
      }
    }
  }, [config?.fontFamily, config?.portfolioId]);

  // Apply theme mode & selection colors
  useEffect(() => {
    const root = document.documentElement;
    const isLight = config?.portfolioId === 'postproduction';

    if (isLight) {
      root.style.setProperty('--color-bg-main', '#ffffff');
      root.style.setProperty('--color-text-main', '#1a1a1a');
      root.style.setProperty('--color-text-muted', '#666666');
      root.style.setProperty('--color-selection', 'rgba(0, 0, 0, 0.15)');
      root.style.setProperty('--color-selection-text', '#1a1a1a');
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.style.setProperty('--color-bg-main', THEME.colors.background);
      root.style.setProperty('--color-text-main', THEME.colors.textMain);
      root.style.setProperty('--color-text-muted', THEME.colors.textMuted);
      root.style.setProperty('--color-selection', THEME.colors.selectionBg);
      root.style.setProperty('--color-selection-text', THEME.colors.textMain);
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
  }, [config?.portfolioId]);

  return null;
};
