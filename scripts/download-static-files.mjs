#!/usr/bin/env node
/**
 * Download portfolio-specific robots.txt and sitemap.xml into the publish directory.
 *
 * These must exist as real files in `dist/`, not as proxy redirects: Netlify's
 * catch-all SPA rewrite (`/*` -> `/index.html`) serves index.html for any path
 * with no file behind it, which is why /robots.txt and /sitemap.xml were both
 * returning HTML instead of their real contents.
 *
 * Files are written atomically: the temp file is only renamed into place once the
 * full body has been fetched and validated, so a truncated or error response can
 * never replace a good file.
 *
 * Usage: node scripts/download-static-files.mjs [outputDir]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const PORTFOLIO_MODE = process.env.VITE_PORTFOLIO_MODE || process.env.PORTFOLIO_MODE || 'directing';
const OUT_DIR = path.resolve(REPO_ROOT, process.argv[2] || 'dist');

const DATA_BRANCH = `https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@data/${PORTFOLIO_MODE}`;

function isSitemap(body) {
  return body.includes('<urlset') && body.includes('<loc>');
}

function isRobots(body) {
  return /^\s*User-agent:/im.test(body);
}

const TARGETS = [
  { file: 'robots.txt', url: `${DATA_BRANCH}/robots.txt`, validate: isRobots, describe: 'User-agent' },
  { file: 'sitemap.xml', url: `${DATA_BRANCH}/sitemap.xml`, validate: isSitemap, describe: '<urlset>' },
];

async function download({ file, url, validate, describe }) {
  const dest = path.join(OUT_DIR, file);
  const tmp = `${dest}.tmp`;

  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`${url} responded with HTTP ${response.status}`);
  }

  const body = await response.text();
  if (!validate(body)) {
    throw new Error(`${url} did not look like a valid ${file} (expected ${describe})`);
  }

  // Never let a 200-but-wrong body (e.g. an HTML error page) reach production.
  if (/^\s*</.test(body) && body.trimStart().startsWith('<!DOCTYPE')) {
    throw new Error(`${url} returned HTML instead of ${file}`);
  }

  fs.writeFileSync(tmp, body);
  fs.renameSync(tmp, dest);

  return { file, bytes: Buffer.byteLength(body), url };
}

async function main() {
  console.log(`[static-files] Portfolio mode: ${PORTFOLIO_MODE}`);
  console.log(`[static-files] Output dir:     ${OUT_DIR}`);

  if (!fs.existsSync(OUT_DIR)) {
    throw new Error(`Output directory does not exist: ${OUT_DIR}`);
  }

  const results = [];
  for (const target of TARGETS) {
    results.push(await download(target));
  }

  console.log('[static-files] Downloaded:');
  for (const { file, bytes, url } of results) {
    console.log(`[static-files]   ✅ ${file} (${bytes} bytes) <- ${url}`);
  }
}

main().catch((error) => {
  console.error(`[static-files] ❌ ${error.message}`);
  process.exit(1);
});
