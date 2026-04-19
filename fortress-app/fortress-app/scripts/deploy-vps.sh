#!/bin/bash
# Deploy script for Fortress Intelligence VPS
set -e

echo "🚀 Starting Fortress Intelligence deployment..."

DEPLOY_DIR="/opt/fortress"
APP_NAME="fortress"

# Ensure we're in the deployment directory
cd "$DEPLOY_DIR"

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building application..."
npm run build

echo "🔄 Reloading application with pm2..."
pm2 reload "$APP_NAME" || pm2 start --name "$APP_NAME" npm -- start

echo "✅ Deployment complete!"
pm2 logs "$APP_NAME" --lines 20
