#!/bin/bash
set -e

# Fortress Intelligence - Robust Deployment Script
# Usage: ./scripts/deploy-vps.sh

echo "🚀 Starting Deployment..."

# 1. Pull latest code
echo "📦 Pulling latest changes..."
git pull origin main

# 2. Install dependencies (in case of new packages)
echo "📚 Installing dependencies..."
npm ci

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
cp .env .next/standalone/

# 6. Restart PM2
echo "🔄 Reloading Server..."
pm2 reload fortress-app --update-env

echo "✅ Deployment Complete! App is live."
