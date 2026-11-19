import React, { useState } from 'react';
import { Brand } from '../../types';
import { THEME } from '../../theme';
import { brandImageUrl } from '../../utils/brands';
import { BrandWordmark } from './BrandWordmark';

interface BrandMarkProps {
  brand: Brand;
  /** Show the optional colour artwork on hover. */
  colourOnHover?: boolean;
  /** Base logo height in px used for the optical sizing. */
  height?: number;
  className?: string;
}

/** Optical sizing: target a roughly constant ink area, then cap both axes. */
const TARGET_AREA_FACTOR = 3.7;
const MIN_HEIGHT_FACTOR = 0.55;
const MAX_HEIGHT_FACTOR = 1.85;
const MAX_WIDTH_FACTOR = 4.77;
const COMPACT_BOOST_UNTIL = 2.5;
const COMPACT_BOOST_RATE = 0.15;

function smartLogoSize(ratio: number, baseHeight: number, scale = 1) {
  const safeRatio = ratio > 0 ? ratio : 1;
  const targetArea = baseHeight * baseHeight * TARGET_AREA_FACTOR;
  // Compact and square marks get an optical lift; wide wordmarks stay flatter.
  const compactBoost = 1 + Math.max(0, COMPACT_BOOST_UNTIL - safeRatio) * COMPACT_BOOST_RATE;
  let height = Math.min(
    baseHeight * MAX_HEIGHT_FACTOR,
    Math.max(baseHeight * MIN_HEIGHT_FACTOR, Math.sqrt(targetArea / safeRatio) * compactBoost)
  );
  let width = height * safeRatio;
  const maxWidth = baseHeight * MAX_WIDTH_FACTOR;
  if (width > maxWidth) {
    width = maxWidth;
    height = width / safeRatio;
  }
  return { width: width * scale, height: height * scale };
}

/**
 * A brand's logo, or its wordmark when there is no usable file. A broken
 * image URL falls back to the wordmark instead of showing a broken icon.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({
  brand,
  colourOnHover = false,
  height = THEME.brandWall.logoHeight,
  className = ''
}) => {
  const [failed, setFailed] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);
  const scale = brand.scale ?? 1;
  const smart = ratio ? smartLogoSize(ratio, height, scale) : null;
  const scaledHeight = smart?.height ?? height * scale;
  const scaledWidth = smart?.width;
  const alwaysColour = brand.treatment === 'colour';
  const adaptive = brand.treatment === 'adaptive' && !!brand.logo && !!brand.logoColourOverlay;
  const source = alwaysColour ? (brand.logoColour ?? brand.logo) : brand.logo;

  const measure = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setRatio(img.naturalWidth / img.naturalHeight);
    }
  };

  if (adaptive && !failed) {
    return (
      <span
        className={`relative inline-flex max-w-full items-center justify-center ${className}`}
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        <img
          src={brandImageUrl(brand.logo)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onLoad={measure}
          onError={() => setFailed(true)}
          className="max-w-full object-contain"
          style={{ width: scaledWidth, height: scaledHeight, filter: 'var(--brand-logo-filter)' }}
        />
        <img
          src={brandImageUrl(brand.logoColourOverlay)}
          alt={`${brand.name} logo`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="pointer-events-none absolute inset-0 m-auto max-w-full object-contain"
          style={{ width: scaledWidth, height: scaledHeight }}
        />
      </span>
    );
  }

  if (!source || failed) {
    return (
      <BrandWordmark
        name={brand.name}
        style={brand.wordmark}
        size={height * 1.1}
        scale={brand.scale}
        className={className}
      />
    );
  }

  return (
    <span
      className={`relative inline-flex max-w-full items-center justify-center ${className}`}
      style={{ width: scaledWidth, height: scaledHeight }}
    >
      <img
        src={brandImageUrl(source)}
        alt={`${brand.name} logo`}
        loading="lazy"
        decoding="async"
        onLoad={measure}
        onError={() => setFailed(true)}
        className="max-w-full object-contain transition-opacity duration-500"
        style={{
          width: scaledWidth,
          height: scaledHeight,
          filter: alwaysColour ? 'none' : 'var(--brand-logo-filter)'
        }}
      />

      {!alwaysColour && !adaptive && colourOnHover && brand.logoColour && (
        <img
          src={brandImageUrl(brand.logoColour)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 m-auto max-w-full object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ width: scaledWidth, height: scaledHeight }}
        />
      )}
    </span>
  );
};
