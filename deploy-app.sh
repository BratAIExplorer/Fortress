#!/bin/bash
# deploy-app.sh — Fortress Intelligence Next.js App Deployment
# Run this on the VPS at /opt/fortress to deploy the latest code.
set -e

DEPLOY_DIR="/opt/fortress"
cd "$DEPLOY_DIR"

echo "📥 Pulling latest code..."
git fetch origin main
git reset --hard origin/main

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building (standalone mode)..."
npm run build

# Required for Next.js standalone: static assets and env aren't auto-copied
echo "📋 Copying static assets and env into standalone..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public 2>/dev/null || true
cp .env.local .next/standalone/.env.local

echo "🔄 Reloading pm2..."
chmod +x start.sh
pm2 reload ecosystem.config.js --update-env \
  || pm2 start ecosystem.config.js

pm2 save
echo "✅ Deployment complete!"
pm2 logs fortress --lines 30
