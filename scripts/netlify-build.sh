#!/usr/bin/env bash
# Netlify Build Script
# Runs the appropriate build command based on PORTFOLIO_MODE environment variable
#
# Usage: Set PORTFOLIO_MODE=directing or PORTFOLIO_MODE=postproduction in Netlify env vars

set -e

# Check VITE_ version first (required for frontend) then standard version
PORTFOLIO_MODE="${VITE_PORTFOLIO_MODE:-${PORTFOLIO_MODE:-directing}}"

echo "=============================================="
echo "🚀 Netlify Build Script"
echo "=============================================="
echo "Portfolio Mode: $PORTFOLIO_MODE"
echo "Node Version: $(node --version)"
echo "NPM Version: $(npm --version)"
echo "=============================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run the appropriate build command based on portfolio mode
case "$PORTFOLIO_MODE" in
  "directing")
    echo "🎬 Building DIRECTING portfolio..."
    npm run build:directing
    ;;
  "postproduction")
    echo "🎨 Building POST-PRODUCTION portfolio..."
    npm run build:postprod
    ;;
  *)
    echo "❌ Unknown PORTFOLIO_MODE: $PORTFOLIO_MODE"
    echo "   Valid options: directing, postproduction"
    exit 1
    ;;
esac

echo "=============================================="
echo "🤖 Downloading robots.txt and sitemap.xml..."
echo "=============================================="
# These must be REAL files in dist/. The SPA catch-all rewrite (/* -> /index.html)
# serves index.html for any path without a file behind it, so /robots.txt and
# /sitemap.xml were previously returning HTML instead of their real contents.
node scripts/download-static-files.mjs dist
echo "✅ Wrote robots.txt and sitemap.xml to dist/"
echo "=============================================="

# Fail the build rather than silently deploying a site with a broken sitemap.
for required in dist/robots.txt dist/sitemap.xml; do
  if [ ! -s "$required" ]; then
    echo "❌ Required file missing or empty: $required"
    exit 1
  fi
done
echo "✅ Verified robots.txt and sitemap.xml exist in dist/"

echo "=============================================="
echo "✅ Build complete for: $PORTFOLIO_MODE"
echo "=============================================="
