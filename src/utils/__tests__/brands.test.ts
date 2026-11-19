import { describe, it, expect } from 'vitest';
import {
  AUTO_WORDMARK_STYLES,
  COMPACT_WORDMARK_STYLES,
  brandImageUrl,
  resolveHomeBrands,
  resolveWordmarkStyle
} from '../brands';
import { Brand } from '../../types';

const brands: Brand[] = [
  { id: 'recA', name: 'Anglia Ruskin University London' },
  { id: 'recB', name: 'MINI' },
  { id: 'recC', name: 'TEDx' }
];

describe('resolveHomeBrands', () => {
  it('keeps the curated Home Brands order', () => {
    expect(resolveHomeBrands(['recC', 'recA', 'recB'], brands).map((brand) => brand.id))
      .toEqual(['recC', 'recA', 'recB']);
  });

  it('drops duplicate and unknown IDs', () => {
    expect(resolveHomeBrands(['recB', 'missing', 'recB', 'recA'], brands).map((brand) => brand.id))
      .toEqual(['recB', 'recA']);
  });

  it('returns nothing when there is no selection', () => {
    expect(resolveHomeBrands([], brands)).toEqual([]);
    expect(resolveHomeBrands(undefined, brands)).toEqual([]);
  });

  it('returns nothing when the brand list is missing', () => {
    expect(resolveHomeBrands(['recA'], undefined)).toEqual([]);
  });
});

describe('resolveWordmarkStyle', () => {
  it('honours an explicit style', () => {
    expect(resolveWordmarkStyle('MINI', 'wide')).toBe('wide');
    expect(resolveWordmarkStyle('TEDx', 'editorial')).toBe('editorial');
  });

  it('picks from the automatic styles when unset or set to auto', () => {
    expect(AUTO_WORDMARK_STYLES).toContain(resolveWordmarkStyle('MINI'));
    expect(AUTO_WORDMARK_STYLES).toContain(resolveWordmarkStyle('MINI', 'auto'));
    expect(AUTO_WORDMARK_STYLES).toContain(resolveWordmarkStyle('MINI', null));
  });

  it('is stable for the same name', () => {
    expect(resolveWordmarkStyle('Caroline Andrew')).toBe(resolveWordmarkStyle('Caroline Andrew'));
  });

  it('keeps long names in compact styles so they do not overflow', () => {
    expect(COMPACT_WORDMARK_STYLES)
      .toContain(resolveWordmarkStyle('Anglia Ruskin University London'));
    expect(COMPACT_WORDMARK_STYLES)
      .toContain(resolveWordmarkStyle('University of Central Lancashire London'));
  });
});

describe('brandImageUrl', () => {
  it('adds a small delivery transform to Cloudinary raster URLs', () => {
    expect(brandImageUrl('https://res.cloudinary.com/date24ay6/image/upload/v1/logo.png'))
      .toBe('https://res.cloudinary.com/date24ay6/image/upload/f_auto,q_auto,w_400/v1/logo.png');
  });

  it('leaves SVG and external URLs untouched', () => {
    const svg = 'https://res.cloudinary.com/date24ay6/image/upload/v1/logo.svg';
    const external = 'https://cdn.example.com/logo.png';
    expect(brandImageUrl(svg)).toBe(svg);
    expect(brandImageUrl(external)).toBe(external);
    expect(brandImageUrl(undefined)).toBeUndefined();
  });

  it('does not double-transform an existing delivery URL', () => {
    const transformed = 'https://res.cloudinary.com/date24ay6/image/upload/f_webp,w_1600/v1/logo.png';
    expect(brandImageUrl(transformed)).toBe(transformed);
  });
});
