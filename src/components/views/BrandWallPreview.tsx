import React, { useEffect, useState } from 'react';
import { BrandWall, BrandWallLayout } from '../BrandWall';
import { getPreviewBrands, previewLabel } from '../brand/previewBrands';

/**
 * Dev-only design review page for the brand wall.
 * Open /dev/brands while `npm run dev` is running.
 *
 * Placeholder brands use the real client names; the two image marks exercise
 * the logo path and the colour-on-hover crossfade.
 */

const LAYOUTS: Array<{ key: BrandWallLayout; title: string; note: string }> = [
  {
    key: 'inline',
    title: 'Option C — inline',
    note: 'The chosen layout. One centred, wrapping row under the hero.'
  },
  {
    key: 'grid',
    title: 'Option A — hairline grid',
    note: 'The alternate. Four columns, two on mobile; matches the filmstrip rules.'
  },
  {
    key: 'marquee',
    title: 'Option B — slow marquee',
    note: 'The alternate. Pauses on hover; static wrap under reduced motion.'
  }
];

export const BrandWallPreview: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [colourOnHover, setColourOnHover] = useState(false);
  const isLight = theme === 'light';

  // The real post-production site loads these; the preview needs them too.
  useEffect(() => {
    const href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap';
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }, []);

  const portfolioId = isLight ? 'postproduction' : 'directing';
  const brands = getPreviewBrands(portfolioId);
  const label = previewLabel(portfolioId);

  const themeStyle = (isLight
    ? {
        '--color-bg-main': '#ffffff',
        '--color-text-main': '#1a1a1a',
        '--color-text-muted': '#666666',
        '--color-line': 'rgba(0, 0, 0, 0.10)',
        '--brand-logo-filter': 'brightness(0)',
        '--font-sans': '"DM Sans", system-ui, sans-serif',
        '--font-serif': '"Outfit", system-ui, sans-serif'
      }
    : {
        '--color-bg-main': '#050505',
        '--color-text-main': '#ffffff',
        '--color-text-muted': '#a3a3a3',
        '--color-line': 'rgba(255, 255, 255, 0.10)',
        '--brand-logo-filter': 'brightness(0) invert(1)',
        '--font-sans': 'Inter, system-ui, sans-serif',
        '--font-serif': '"Playfair Display", Georgia, serif'
      }) as React.CSSProperties;

  return (
    <div
      className={`min-h-screen bg-bg-main font-sans text-text-main ${isLight ? 'light-theme' : 'dark-theme'}`}
      style={themeStyle}
    >
      <div className="mx-auto max-w-7xl px-6 pb-4 pt-12 md:px-12 md:pt-16">
        <div
          className="flex flex-wrap items-end justify-between gap-5 border-b pb-5"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Dev preview · dummy brands
            </p>
            <h1 className="mt-2 font-serif text-2xl italic md:text-4xl">
              {label}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex rounded-full border p-0.5"
              style={{ borderColor: 'var(--color-line)' }}
            >
              <button
                type="button"
                onClick={() => setTheme('dark')}
                aria-pressed={!isLight}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition ${!isLight ? 'bg-text-main text-bg-main' : 'text-text-muted hover:text-text-main'}`}
              >
                Directing / dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                aria-pressed={isLight}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition ${isLight ? 'bg-text-main text-bg-main' : 'text-text-muted hover:text-text-main'}`}
              >
                Post / light
              </button>
            </div>

            <button
              type="button"
              onClick={() => setColourOnHover((value) => !value)}
              aria-pressed={colourOnHover}
              className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition ${colourOnHover ? 'bg-text-main text-bg-main' : 'text-text-muted hover:text-text-main'}`}
              style={{ borderColor: 'var(--color-line)' }}
            >
              Colour on hover: {colourOnHover ? 'on' : 'off'}
            </button>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
          Hover a mark to see the opacity lift. The two image marks exercise the
          logo path; everything else is the typographic fallback generated from
          the brand name.
        </p>
      </div>

      {LAYOUTS.map(({ key, title, note }) => (
        <div
          key={key}
          data-layout={key}
          className="border-t"
          style={{ borderColor: 'var(--color-line)' }}
        >
          <div className="mx-auto max-w-7xl px-6 pt-8 md:px-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              {title}
            </p>
            <p className="mt-1 text-xs text-text-muted opacity-70">{note}</p>
          </div>
          <BrandWall
            key={`${key}-${theme}-${colourOnHover}`}
            brands={brands}
            label={label}
            layout={key}
            colourOnHover={colourOnHover}
          />
        </div>
      ))}

      <div className="pb-24" />
    </div>
  );
};
