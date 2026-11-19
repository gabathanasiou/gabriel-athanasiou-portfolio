import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { WordmarkStyle } from '../../types';
import { THEME } from '../../theme';
import { resolveWordmarkStyle } from '../../utils/brands';

interface BrandWordmarkProps {
  name: string;
  /** Airtable `Wordmark Style`; `auto` (or empty) picks one from the name. */
  style?: WordmarkStyle | null;
  /** Base font size in px. */
  size?: number;
  /** Per-brand optical scale from Airtable. */
  scale?: number;
  className?: string;
}

const STYLE_MAP: Record<Exclude<WordmarkStyle, 'auto'>, React.CSSProperties> = {
  wide: {
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase',
    letterSpacing: '0.34em',
    fontWeight: 600
  },
  thin: {
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase',
    letterSpacing: '0.26em',
    fontWeight: 300
  },
  black: {
    fontFamily: 'var(--font-sans)',
    letterSpacing: '-0.03em',
    fontWeight: 900
  },
  serif: {
    // Playfair is loaded on both sites; using it explicitly keeps "Serif"
    // actually serif on Lemon Post, where --font-serif is Outfit.
    fontFamily: '"Playfair Display", Georgia, serif',
    fontWeight: 400
  },
  editorial: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontStyle: 'italic',
    fontWeight: 400
  },
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    letterSpacing: '-0.04em',
    fontWeight: 700
  },
  lower: {
    fontFamily: 'var(--font-sans)',
    textTransform: 'lowercase',
    letterSpacing: '-0.045em',
    fontWeight: 800
  },
  tight: {
    fontFamily: 'var(--font-sans)',
    letterSpacing: '-0.03em',
    fontWeight: 800
  }
};

/**
 * A brand name set as a wordmark when there is no logo file. It measures its
 * own width once mounted and shrinks to fit the cell/row, so a long name never
 * pushes the layout wider than the page.
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  name,
  style,
  size = THEME.brandWall.wordmarkSize,
  scale = 1,
  className = ''
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState(1);
  const [wraps, setWraps] = useState(false);
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  const resolved = resolveWordmarkStyle(name, style);
  const baseSize = size * scale * (narrow ? 0.82 : 1);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const onChange = () => setNarrow(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const measure = () => {
      // Measure on one line at the intended size.
      el.style.whiteSpace = 'nowrap';
      el.style.fontSize = `${baseSize}px`;
      const natural = el.scrollWidth;
      const available = parent.clientWidth;
      const ratio = natural > available && available > 0
        ? available / natural
        : 1;

      // Below this ratio the text would be too small to read. Wrap it at a
      // readable size instead of shrinking further.
      const nextWraps = ratio < 0.6;
      const nextFit = nextWraps ? 0.75 : ratio;

      // Restore the measured size immediately. React may bail out of the state
      // update when the value is unchanged, which would otherwise leave the
      // element at the unshrunk measurement size.
      el.style.whiteSpace = nextWraps ? 'normal' : 'nowrap';
      el.style.fontSize = `${baseSize * nextFit}px`;
      setWraps(nextWraps);
      setFit(nextFit);
    };

    measure();

    // The parent can clamp after the first paint (e.g. Tailwind's max-width
    // utility arriving late), so re-fit when its box changes.
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [name, resolved, baseSize]);

  return (
    <span
      ref={ref}
      className={`inline-block max-w-full ${className}`}
      style={{
        ...STYLE_MAP[resolved],
        fontSize: `${baseSize * fit}px`,
        lineHeight: wraps ? 1.15 : 1,
        whiteSpace: wraps ? 'normal' : 'nowrap',
        overflowWrap: 'break-word',
        textAlign: 'center'
      }}
    >
      {name}
    </span>
  );
};
