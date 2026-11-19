import { Brand, WordmarkStyle } from '../types';

type ResolvedWordmarkStyle = Exclude<WordmarkStyle, 'auto'>;

/**
 * Styles used when a brand has no logo file. They are all built from the two
 * fonts the site already loads, so the wall adds no font downloads.
 */
export const AUTO_WORDMARK_STYLES: ResolvedWordmarkStyle[] = [
  'wide',
  'thin',
  'black',
  'serif',
  'editorial',
  'mono',
  'lower',
  'tight'
];

/**
 * Long names can't carry wide letter-spacing without shrinking to an
 * unreadable size, so automatic picks for them stay compact.
 */
export const COMPACT_WORDMARK_STYLES: ResolvedWordmarkStyle[] = [
  'black',
  'tight',
  'lower',
  'serif'
];

const LONG_NAME_LENGTH = 18;

/** FNV-1a: small, stable, and identical on every render/visit. */
function hashName(name: string): number {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i += 1) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Resolve the typographic treatment for a brand name. An explicit Airtable
 * style always wins; otherwise the name deterministically picks one, so a
 * brand never changes its look between visits.
 */
export function resolveWordmarkStyle(
  name: string,
  style?: WordmarkStyle | null
): ResolvedWordmarkStyle {
  if (style && style !== 'auto') return style;

  const pool = name.trim().length > LONG_NAME_LENGTH
    ? COMPACT_WORDMARK_STYLES
    : AUTO_WORDMARK_STYLES;

  return pool[hashName(name) % pool.length];
}

/**
 * Cloudinary delivery for brand raster art. The wall is 22px tall; a 400px
 * source is plenty. SVGs and external URLs are left untouched.
 */
export function brandImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:') || /\.svg(?:\?|$)/i.test(url)) return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;

  const afterUpload = url.split('/image/upload/')[1] || '';
  const firstSegment = afterUpload.split('/')[0] || '';
  if (/\b(f|q|w)_/.test(firstSegment)) return url;

  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_400/');
}

/**
 * Turn the curated `Home Brands` order into renderable brands.
 * Unknown IDs are dropped, duplicates are ignored, and there is no automatic
 * fallback: if the selection is empty, the wall is empty.
 */
export function resolveProjectBrands(
  brandIds: string[] | undefined,
  brands: Brand[] | undefined
): Brand[] {
  return resolveHomeBrands(brandIds, brands);
}

export function resolveHomeBrands(
  brandIds: string[] | undefined,
  brands: Brand[] | undefined
): Brand[] {
  if (!brandIds?.length || !brands?.length) return [];

  const byId = new Map(brands.map((brand) => [brand.id, brand]));
  const seen = new Set<string>();
  const resolved: Brand[] = [];

  for (const id of brandIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const brand = byId.get(id);
    if (brand) resolved.push(brand);
  }

  return resolved;
}
