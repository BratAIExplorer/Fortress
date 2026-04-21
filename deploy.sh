#!/bin/bash
# Fortress Intelligence - Production Deploy Script
# Run from root folder: bash deploy.sh

set -e
echo "=== 🛡️ Fortress Intelligence Deploy v2 ==="

# 1. Update Schema
echo "📦 Syncing Database Schema..."
npm run drizzle:push

# 2. Build
echo "🏗️ Building standalone application..."
npm run build

# 3. Copy static assets (CRITICAL for standalone builds)
echo "📂 Mapping static assets..."
# Ensure the target folders exist
mkdir -p .next/standalone/.next/static
mkdir -p .next/standalone/public

# Copy the assets
cp -r .next/static/. .next/standalone/.next/static/
cp -r public/. .next/standalone/public/

# 4. Copy environment
echo "🔑 Updating environment variables..."
cp .env.local .next/standalone/.env.local

# 5. Restart PM2
echo "🔄 Restarting application service..."
# Try both names to be safe during transition
pm2 restart fortress 2>/dev/null || pm2 restart fortress-app 2>/dev/null || pm2 start ecosystem.config.js --name fortress

echo "✅ Deploy complete!"
echo "Site: https://fortressintelligence.space"
echo "Monitor logs with: pm2 logs fortress"
