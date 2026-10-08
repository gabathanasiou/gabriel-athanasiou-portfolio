#!/usr/bin/env node
/**
 * Local serving check for dist/robots.txt and dist/sitemap.xml.
 *
 * Reproduces Netlify's documented request chain for this site: a real file in the
 * publish directory wins over the catch-all SPA rewrite (`/*` -> `/index.html`),
 * and only paths with no file behind them fall back to index.html.
 *
 * This exists because the original bug was invisible in the build output: the
 * proxy redirects were being appended to dist/_redirects and looked correct,
 * but the live site still returned index.html for /robots.txt and /sitemap.xml.
 *
 * Usage: node scripts/verify-static-files.mjs [distDir]
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', process.argv[2] || 'dist');

const TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=utf-8',
};

/** Mirrors Netlify: real file first, catch-all rewrite second. */
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const filePath = path.join(DIST, urlPath);

  // Guard against path traversal in the test harness.
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403).end('forbidden');
    return;
  }

  if (urlPath !== '/' && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'content-type': TYPES[path.extname(filePath)] ?? 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
    return;
  }

  // SPA catch-all: /* -> /index.html 200 (applies to every unmatched path)
  const index = path.join(DIST, 'index.html');
  if (fs.existsSync(index)) {
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    res.end(fs.readFileSync(index));
    return;
  }

  res.writeHead(404).end('not found');
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;

const cases = [
  { path: '/robots.txt', expectType: /text\/plain/, expectBody: /User-agent:/i, avoidBody: /<!DOCTYPE/i },
  { path: '/sitemap.xml', expectType: /application\/xml/, expectBody: /<urlset/, avoidBody: /<!DOCTYPE/i },
  { path: '/sitemap.xml', expect: (body) => (body.match(/<loc>/g) ?? []).length >= 40, label: 'contains all project URLs' },
  // These should keep behaving exactly as before this change.
  { path: '/work', expectBody: /<!DOCTYPE/i, label: 'SPA shell still served' },
  { path: '/nonexistent-route-xyz', expectBody: /<!DOCTYPE/i, label: 'SPA fallback still served' },
];

let failures = 0;

for (const testCase of cases) {
  const response = await fetch(`${base}${testCase.path}`);
  const body = await response.text();
  const type = response.headers.get('content-type') ?? '';
  const problems = [];

  if (testCase.expectType && !testCase.expectType.test(type)) {
    problems.push(`content-type ${type} !~ ${testCase.expectType}`);
  }
  if (testCase.expectBody && !testCase.expectBody.test(body)) {
    problems.push(`body did not match ${testCase.expectBody}`);
  }
  if (testCase.avoidBody && testCase.avoidBody.test(body)) {
    problems.push('body contained HTML document');
  }
  if (testCase.expect && !testCase.expect(body)) {
    problems.push('custom expectation failed');
  }

  const label = testCase.label ?? testCase.path;

  if (problems.length > 0) {
    failures += 1;
    console.log(`❌ ${label} -> ${problems.join('; ')}`);
  } else {
    console.log(`✅ ${label} (${type}, ${body.length} bytes)`);
  }
}

server.close();

if (failures > 0) {
  console.error(`\n❌ ${failures} check(s) failed`);
  process.exit(1);
}
console.log('\n✅ robots.txt and sitemap.xml serve as real files; SPA routes unaffected');
