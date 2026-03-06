#!/usr/bin/env bash
# Netlify Build Script
# Runs the appropriate build command based on PORTFOLIO_MODE environment variable
#
# Usage: Set PORTFOLIO_MODE=directing or PORTFOLIO_MODE=postproduction in Netlify env vars

set -e

# Default to directing if not set
PORTFOLIO_MODE="${PORTFOLIO_MODE:-directing}"

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
echo "🔗 Generating dynamic CDN proxy redirects..."
echo "=============================================="
echo "/sitemap.xml    https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@main/${PORTFOLIO_MODE}/sitemap.xml   200" >> dist/_redirects
echo "/robots.txt     https://cdn.jsdelivr.net/gh/gabathanasiou/gabriel-portfolio-data@main/${PORTFOLIO_MODE}/robots.txt    200" >> dist/_redirects
echo "✅ Appended to dist/_redirects"
echo "=============================================="
echo "✅ Build complete for: $PORTFOLIO_MODE"
echo "=============================================="
