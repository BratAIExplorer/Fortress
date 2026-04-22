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
echo "📋 Syncing static assets into standalone build..."
# Find the actual location of server.js inside standalone folder
SERVER_PATH=$(find .next/standalone -name "server.js" | head -n 1)

if [ -z "$SERVER_PATH" ]; then
  echo "❌ Error: server.js not found in .next/standalone. Build may have failed or output: 'standalone' is missing."
  exit 1
fi

STANDALONE_DIR=$(dirname "$SERVER_PATH")
echo "📍 Found standalone server at: $SERVER_PATH"

# Copy required assets to the standalone directory
mkdir -p "$STANDALONE_DIR/.next"
cp -r .next/static "$STANDALONE_DIR/.next/static"
cp -r public "$STANDALONE_DIR/public" 2>/dev/null || true
cp .env.local "$STANDALONE_DIR/.env.local"

echo "🔄 Reloading pm2..."
chmod +x start.sh
pm2 reload ecosystem.config.js --update-env \
  || pm2 start ecosystem.config.js

pm2 save
echo "✅ Deployment complete!"
pm2 status fortress
