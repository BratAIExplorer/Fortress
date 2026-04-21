#!/bin/bash
set -e

# Fortress Intelligence - Robust Deployment Script
# Usage: ./scripts/deploy-vps.sh

echo "🚀 Starting Deployment..."

# 1. Sync Database
echo "📦 Syncing Database Schema..."
export $(grep -v '^#' .env.local | xargs)
npm run drizzle:push || echo "⚠️ Warning: Schema sync failed. Proceeding with build..."

# 2. Build the Next.js app
echo "🏗️ Building application..."
npm run build

# 3. Map Assets
echo "📂 Mapping static assets for standalone mode..."
mkdir -p .next/standalone/.next/static
mkdir -p .next/standalone/public
cp -r .next/static/. .next/standalone/.next/static/
cp -r public/. .next/standalone/public/
cp .env.local .next/standalone/.env.local

# 4. Restart PM2 (using ecosystem.config.js)
echo "🔄 Reloading Server..."
npm run deploy:reload

echo "✅ SUCCESS! App is live."
