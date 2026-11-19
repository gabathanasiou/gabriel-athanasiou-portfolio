import React, { useState } from 'react';
import { Brand } from '../../types';
import { THEME } from '../../theme';
import { brandImageUrl } from '../../utils/brands';
import { BrandWordmark } from './BrandWordmark';

interface BrandMarkProps {
  brand: Brand;
  /** Show the optional colour artwork on hover. */
  colourOnHover?: boolean;
  /** Rendered logo height in px. */
  height?: number;
  className?: string;
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
  const scaledHeight = height * (brand.scale ?? 1);
  const alwaysColour = brand.treatment === 'colour';
  const adaptive = brand.treatment === 'adaptive' && !!brand.logo && !!brand.logoColourOverlay;
  const source = alwaysColour ? (brand.logoColour ?? brand.logo) : brand.logo;

  if (adaptive && !failed) {
    return (
      <span
        className={`relative inline-flex max-w-full items-center justify-center ${className}`}
        style={{ height: scaledHeight }}
      >
        <img
          src={brandImageUrl(brand.logo)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="max-w-full object-contain"
          style={{ height: scaledHeight, filter: 'var(--brand-logo-filter)' }}
        />
        <img
          src={brandImageUrl(brand.logoColourOverlay)}
          alt={`${brand.name} logo`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="pointer-events-none absolute inset-0 m-auto max-w-full object-contain"
          style={{ height: scaledHeight }}
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
      style={{ height: scaledHeight }}
    >
      <img
        src={brandImageUrl(source)}
        alt={`${brand.name} logo`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="max-w-full object-contain transition-opacity duration-500"
        style={{
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
          style={{ height: scaledHeight }}
        />
      )}
    </span>
  );
};
