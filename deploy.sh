#!/bin/bash
# Fortress Intelligence - Production Deploy Script
# Run from /opt/fortress: bash deploy.sh

set -e
echo "=== Fortress Intelligence Deploy ==="

cd /opt/fortress

# 1. Build
echo "Building..."
npm run build

# 2. Copy static assets (REQUIRED for standalone builds)
echo "Copying static assets..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# 3. Copy env
cp .env.local .next/standalone/.env.local

# 4. Restart
echo "Restarting..."
pm2 restart fortress-app

echo "=== Deploy complete ==="
echo "Site: https://fortressintelligence.space"
