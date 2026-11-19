import { Brand, WordmarkStyle } from '../../types';

/**
 * Dev-only placeholder brands for reviewing the wall before the data sync
 * lands. They use the real client names and the same wordmark rules the
 * production component will use; only the logo files are stand-ins.
 */

function svgLogo(label: string, colour: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 60"><text x="130" y="48" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="46" font-weight="900" letter-spacing="4" fill="${colour}">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function boxLogo(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80"><rect width="260" height="80" rx="10" fill="#121019"/><text x="130" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#ffffff">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const wordmark = (id: string, name: string, style: WordmarkStyle, website?: string): Brand => ({
  id,
  name,
  wordmark: style,
  website
});

export const DARK_BRANDS: Brand[] = [
  wordmark('anglia', 'Anglia Ruskin University London', 'black'),
  wordmark('underhill', 'Underhill West', 'editorial'),
  wordmark('gilley', 'Gilley', 'serif'),
  wordmark('fraqua', 'Fraqua', 'lower'),
  wordmark('lobros', 'LoBros', 'tight'),
  wordmark('diesel', 'Diesel', 'black'),
  wordmark('wakecup', 'WakeCup', 'wide'),
  wordmark('caroline', 'Caroline Andrew', 'editorial'),
  {
    id: 'kitt',
    name: 'Kitt Medical',
    logo: boxLogo('kitt medical'),
    treatment: 'colour'
  },
  wordmark('squid', 'Squid Loyalty', 'wide'),
  wordmark('medical', 'Medical Tracker', 'thin'),
  {
    id: 'mini',
    name: 'MINI',
    logo: svgLogo('MINI', '#ffffff'),
    logoColour: svgLogo('MINI', '#ffffff'),
    website: 'https://www.mini.co.uk'
  }
];

export const LIGHT_BRANDS: Brand[] = [
  wordmark('anglia', 'Anglia Ruskin University London', 'black'),
  wordmark('paq', 'PAQ', 'black'),
  wordmark('underhill', 'Underhill West', 'editorial'),
  wordmark('ms', 'M&S', 'serif', 'https://www.marksandspencer.com'),
  wordmark('clientearth', 'ClientEarth', 'serif'),
  wordmark('bugzy', 'Bugzy Malone', 'black'),
  wordmark('embrace', 'Embrace Building Wraps', 'tight'),
  wordmark('gilley', 'Gilley', 'serif'),
  wordmark('fraqua', 'Fraqua', 'lower'),
  wordmark('lobros', 'LoBros', 'tight'),
  wordmark('wakecup', 'WakeCup', 'wide'),
  {
    id: 'pepsi',
    name: 'Pepsi',
    logo: svgLogo('PEPSI', '#0b3d91'),
    logoColour: svgLogo('PEPSI', '#0b3d91'),
    website: 'https://www.pepsi.com'
  }
];

export function getPreviewBrands(portfolioId?: string): Brand[] {
  return portfolioId === 'postproduction' ? LIGHT_BRANDS : DARK_BRANDS;
}

export function previewLabel(portfolioId?: string): string {
  return portfolioId === 'postproduction' ? 'Trusted by' : "Brands I've worked with";
}
