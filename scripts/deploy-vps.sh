#!/bin/bash
set -e

# Fortress Intelligence - Robust Deployment Script
# Usage: ./scripts/deploy-vps.sh

echo "🚀 Starting Deployment..."

# 1. Update code
echo "📦 Updating code from repository..."
git fetch origin main
git reset --hard origin/main

# 2. Install dependencies
echo "📚 Installing dependencies..."
npm install

# 3. Build the Next.js app
echo "🏗️ Building application..."
npm run build

# 4. Preparing Standalone Directory
echo "🧹 Preparing standalone assets..."
# Remove old static assets to prevent conflicts/bloat
rm -rf .next/standalone/.next/static
rm -rf .next/standalone/public

# Ensure directories exist
mkdir -p .next/standalone/.next
mkdir -p .next/standalone/public

# 5. Copy NEW assets (Critical Step)
echo "📋 Copying fresh assets..."
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
cp .env.local .next/standalone/.env.local

# 6. Restart PM2 (using ecosystem.config.js)
echo "🔄 Reloading Server..."
npm run deploy:reload

echo "✅ Deployment Complete! App is live."
