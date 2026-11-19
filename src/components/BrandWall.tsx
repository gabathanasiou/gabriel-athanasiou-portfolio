import React from 'react';
import { Brand } from '../types';
import { THEME } from '../theme';
import { BrandMark } from './brand/BrandMark';

export type BrandWallLayout = 'inline' | 'grid' | 'marquee';

interface BrandWallProps {
  brands: Brand[];
  label?: string;
  layout?: BrandWallLayout;
  colourOnHover?: boolean;
  className?: string;
}

interface BrandItemProps {
  brand: Brand;
  colourOnHover: boolean;
}

const lineStyle = { borderColor: 'var(--color-line)' };

const BrandItem: React.FC<BrandItemProps> = ({ brand, colourOnHover }) => {
  const className = [
    'group inline-flex min-w-0 max-w-full items-center justify-center',
    'opacity-60 transition-opacity duration-500 hover:opacity-100 focus-visible:opacity-100',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8'
  ].join(' ');
  const style = { outlineColor: 'var(--color-text-main)' };

  const mark = (
    <BrandMark
      brand={brand}
      colourOnHover={colourOnHover}
      height={THEME.brandWall.logoHeight}
    />
  );

  if (!brand.website) {
    return (
      <span className={className} style={style}>
        {mark}
      </span>
    );
  }

  return (
    <a
      href={brand.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${brand.name}`}
      className={className}
      style={style}
    >
      {mark}
    </a>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode; count?: number }> = ({
  children,
  count
}) => (
  <div
    className="mb-8 flex items-end justify-between gap-6 border-b pb-4"
    style={lineStyle}
  >
    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
      {children}
    </span>
    {typeof count === 'number' && (
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
        {count} {count === 1 ? 'brand' : 'brands'}
      </span>
    )}
  </div>
);

const MarqueeGroup: React.FC<{
  brands: Brand[];
  colourOnHover: boolean;
  hidden?: boolean;
}> = ({ brands, colourOnHover, hidden = false }) => (
  <div
    className={[
      'flex items-center gap-x-14 pr-14 md:gap-x-20 md:pr-20',
      'motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-8 motion-reduce:pr-0',
      hidden ? 'motion-reduce:hidden' : ''
    ].join(' ')}
    aria-hidden={hidden || undefined}
    inert={hidden || undefined}
  >
    {brands.map((brand) => (
      <BrandItem key={`${hidden ? 'dup-' : ''}${brand.id}`} brand={brand} colourOnHover={colourOnHover} />
    ))}
  </div>
);

/**
 * The home-page brand wall. `inline` is the default (C); `grid` and `marquee`
 * remain available as Settings-switchable alternates. The brands always come
 * from the portfolio's curated `Home Brands` selection.
 */
export const BrandWall: React.FC<BrandWallProps> = ({
  brands,
  label = THEME.brandWall.defaultLabel,
  layout = THEME.brandWall.defaultLayout,
  colourOnHover = THEME.brandWall.defaultColourOnHover,
  className = ''
}) => {
  if (brands.length === 0) return null;

  const container = THEME.brandWall.container;
  const section = `${THEME.brandWall.sectionPadding} ${className}`.trim();

  if (layout === 'grid') {
    return (
      <section className={section} aria-label={label}>
        <div className={container}>
          <SectionLabel count={brands.length}>{label}</SectionLabel>
          <div
            className="grid grid-cols-2 border-l border-t md:grid-cols-4"
            style={lineStyle}
          >
            {brands.map((brand) => (
              <div key={brand.id} className={THEME.brandWall.gridCell} style={lineStyle}>
                <BrandItem brand={brand} colourOnHover={colourOnHover} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'marquee') {
    return (
      <section className={section} aria-label={label}>
        <div className={container}>
          <SectionLabel count={brands.length}>{label}</SectionLabel>
        </div>

        <div
          className="brand-marquee overflow-hidden border-y py-10 md:py-11"
          style={lineStyle}
        >
          <div className="brand-marquee-track flex w-max items-center motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
            <MarqueeGroup brands={brands} colourOnHover={colourOnHover} />
            <MarqueeGroup brands={brands} colourOnHover={colourOnHover} hidden />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={section} aria-label={label}>
      <div className={container}>
        <div className="mb-9 text-center md:mb-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-text-muted">
            {label}
          </span>
        </div>
        <div className={`flex flex-wrap items-center justify-center ${THEME.brandWall.inlineGap}`}>
          {brands.map((brand) => (
            <BrandItem key={brand.id} brand={brand} colourOnHover={colourOnHover} />
          ))}
        </div>
      </div>
    </section>
  );
};
