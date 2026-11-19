import React, { useEffect, useState } from 'react';
import { Brand } from '../types';
import { THEME } from '../theme';
import { BrandMark } from './brand/BrandMark';

export type BrandWallLayout = 'inline' | 'grid' | 'marquee';

export interface BrandWallEditHandlers {
  selectedBrandId: string | null;
  onSelect: (brandId: string) => void;
  onReorder: (fromIndex: number, toIndex: number, mode: 'swap' | 'before' | 'after') => void;
}

type DropMode = 'swap' | 'before' | 'after';

interface DropState {
  mode: DropMode;
  index: number;
  x: number;
  y: number;
  height: number;
}

interface BrandWallProps {
  brands: Brand[];
  label?: string;
  layout?: BrandWallLayout;
  colourOnHover?: boolean;
  /** Base logo height in px; individual brands still apply their Scale. */
  logoHeight?: number;
  /** Multiplier for section padding and row/column gaps. */
  spacing?: number;
  /** Enables click-to-select and drag-to-reorder in the editor. */
  edit?: BrandWallEditHandlers;
  className?: string;
}

interface BrandItemProps {
  brand: Brand;
  colourOnHover: boolean;
  logoHeight: number;
  index: number;
  edit?: BrandWallEditHandlers;
  dropTarget?: boolean;
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
}

const lineStyle = { borderColor: 'var(--color-line)' };

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

const BrandItem: React.FC<BrandItemProps> = ({
  brand,
  colourOnHover,
  logoHeight,
  index,
  edit,
  dropTarget,
  onDragStart,
  onDragEnd
}) => {
  const selected = edit?.selectedBrandId === brand.id;
  const className = [
    'group inline-flex min-w-0 max-w-full items-center justify-center',
    edit
      ? 'relative cursor-grab rounded-md px-2 py-1 opacity-100 outline-offset-4 transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400 active:cursor-grabbing'
      : 'opacity-60 transition-opacity duration-500 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8',
    edit && dropTarget
      ? 'outline outline-2 outline-dashed outline-lime-400 bg-lime-400/10'
      : edit && selected
        ? 'outline outline-2 outline-lime-400'
        : edit
          ? 'outline outline-1 outline-transparent'
          : ''
  ].join(' ');
  const style = edit ? undefined : { outlineColor: 'var(--color-text-main)' };

  const mark = (
    <BrandMark
      brand={brand}
      colourOnHover={colourOnHover}
      height={logoHeight}
    />
  );

  if (edit) {
    return (
      <span
        className={className}
        style={style}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`Edit ${brand.name}`}
        title="Click to edit · drag to reorder · drop on a logo to swap"
        data-brand-index={index}
        onClick={() => edit.onSelect(brand.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            edit.onSelect(brand.id);
          }
        }}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', String(index));
          onDragStart?.(index);
        }}
        onDragEnd={onDragEnd}
      >
        {mark}
      </span>
    );
  }

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
  logoHeight: number;
  gap: number;
  hidden?: boolean;
}> = ({ brands, colourOnHover, logoHeight, gap, hidden = false }) => (
  <div
    className={[
      'flex items-center',
      'motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-8 motion-reduce:pr-0',
      hidden ? 'motion-reduce:hidden' : ''
    ].join(' ')}
    style={{ columnGap: gap, paddingRight: gap }}
    aria-hidden={hidden || undefined}
    inert={hidden || undefined}
  >
    {brands.map((brand, index) => (
      <BrandItem
        key={`${hidden ? 'dup-' : ''}${brand.id}`}
        brand={brand}
        colourOnHover={colourOnHover}
        logoHeight={logoHeight}
        index={index}
      />
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
  logoHeight,
  spacing = 1,
  edit,
  className = ''
}) => {
  const isDesktop = useIsDesktop();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [drop, setDrop] = useState<DropState | null>(null);
  const dropRef = React.useRef<DropState | null>(null);

  if (brands.length === 0) return null;

  const baseLogoHeight = logoHeight ?? THEME.brandWall.logoHeight;
  const spacingValue = Math.min(2, Math.max(0.5, spacing));
  const sectionPaddingTop = (isDesktop ? 64 : 48) * spacingValue;
  const rowGap = (isDesktop ? 32 : 24) * spacingValue;
  const columnGap = (isDesktop ? 48 : 32) * spacingValue;
  const labelGap = (isDesktop ? 32 : 28) * spacingValue;
  const gridPadding = (isDesktop ? 32 : 24) * spacingValue;
  const sectionStyle = { paddingTop: `${sectionPaddingTop}px` };
  const container = THEME.brandWall.container;
  const section = `${THEME.brandWall.sectionPadding} ${className}`.trim();

  const updateDrop = (next: DropState | null) => {
    dropRef.current = next;
    setDrop(next);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
    updateDrop(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    updateDrop(null);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    updateDrop(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    if (!edit || dragIndex === null) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    const containerEl = event.currentTarget as HTMLElement;
    const containerRect = containerEl.getBoundingClientRect();
    const items = Array.from(
      containerEl.querySelectorAll<HTMLElement>('[data-brand-index]')
    );
    if (items.length === 0) return;

    let best: { element: HTMLElement; rect: DOMRect; distance: number } | null = null;
    for (const element of items) {
      const rect = element.getBoundingClientRect();
      const dx = event.clientX < rect.left
        ? rect.left - event.clientX
        : event.clientX > rect.right
          ? event.clientX - rect.right
          : 0;
      const dy = event.clientY < rect.top
        ? rect.top - event.clientY
        : event.clientY > rect.bottom
          ? event.clientY - rect.bottom
          : 0;
      const distance = Math.hypot(dx, dy);
      if (!best || distance < best.distance) best = { element, rect, distance };
    }

    if (!best) return;
    const targetIndex = Number(best.element.dataset.brandIndex);
    if (!Number.isFinite(targetIndex) || targetIndex === dragIndex) {
      updateDrop(null);
      return;
    }

    const relX = (event.clientX - best.rect.left) / Math.max(1, best.rect.width);
    const mode: DropMode = event.clientX < best.rect.left
      ? 'before'
      : event.clientX > best.rect.right
        ? 'after'
        : relX < 0.28
          ? 'before'
          : relX > 0.72
            ? 'after'
            : 'swap';

    const rawX = mode === 'before'
      ? best.rect.left - containerRect.left - 4
      : best.rect.right - containerRect.left + 4;
    const x = Math.max(0, Math.min(containerRect.width, rawX));
    const next: DropState = {
      mode,
      index: targetIndex,
      x,
      y: best.rect.top - containerRect.top,
      height: best.rect.height
    };

    const current = dropRef.current;
    if (
      current &&
      current.mode === next.mode &&
      current.index === next.index &&
      Math.round(current.x) === Math.round(next.x) &&
      Math.round(current.y) === Math.round(next.y)
    ) {
      return;
    }
    updateDrop(next);
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    const target = dropRef.current;
    if (edit && dragIndex !== null && target) {
      edit.onReorder(dragIndex, target.index, target.mode);
    }
    setDragIndex(null);
    updateDrop(null);
  };

  const dropLine = edit && drop && drop.mode !== 'swap' ? (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute z-30 w-[2px] -translate-x-1/2 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]"
      style={{ left: drop.x, top: drop.y, height: drop.height }}
    />
  ) : null;

  if (layout === 'grid') {
    return (
      <section className={section} style={sectionStyle} aria-label={label}>
        <div className={container}>
          <SectionLabel count={brands.length}>{label}</SectionLabel>
          <div
            className="relative grid grid-cols-2 border-l border-t md:grid-cols-4"
            style={lineStyle}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {brands.map((brand, index) => (
              <div
                key={brand.id}
                className={THEME.brandWall.gridCell}
                style={{ ...lineStyle, padding: `${gridPadding}px` }}
              >
                <BrandItem
                  brand={brand}
                  colourOnHover={colourOnHover}
                  logoHeight={baseLogoHeight}
                  index={index}
                  edit={edit}
                  dropTarget={drop?.mode === 'swap' && drop.index === index}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              </div>
            ))}
            {dropLine}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'marquee') {
    return (
      <section className={section} style={sectionStyle} aria-label={label}>
        <div className={container}>
          <SectionLabel count={brands.length}>{label}</SectionLabel>
        </div>

        <div
          className="brand-marquee overflow-hidden border-y py-10 md:py-11"
          style={lineStyle}
        >
          <div className="brand-marquee-track flex w-max items-center motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
            <MarqueeGroup
              brands={brands}
              colourOnHover={colourOnHover}
              logoHeight={baseLogoHeight}
              gap={columnGap}
            />
            <MarqueeGroup
              brands={brands}
              colourOnHover={colourOnHover}
              logoHeight={baseLogoHeight}
              gap={columnGap}
              hidden
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={section} style={sectionStyle} aria-label={label}>
      <div className={container}>
        <div className="text-center" style={{ marginBottom: `${labelGap}px` }}>
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-text-muted">
            {label}
          </span>
        </div>
        <div
          className={`relative flex flex-wrap items-center justify-center ${THEME.brandWall.inlineGap}`}
          style={{ rowGap: `${rowGap}px`, columnGap: `${columnGap}px` }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {brands.map((brand, index) => (
            <BrandItem
              key={brand.id}
              brand={brand}
              colourOnHover={colourOnHover}
              logoHeight={baseLogoHeight}
              index={index}
              edit={edit}
              dropTarget={drop?.mode === 'swap' && drop.index === index}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
          {dropLine}
        </div>
      </div>
    </section>
  );
};
