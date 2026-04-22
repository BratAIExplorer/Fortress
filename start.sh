#!/bin/bash
# Load env vars and start the Next.js standalone server.
# Required because standalone mode does not auto-read .env.local.
set -a
if [ -f "$(dirname "$0")/.env.local" ]; then
  source "$(dirname "$0")/.env.local"
fi
set +a

# Find the standalone server.js dynamically
SERVER_PATH=$(find "$(dirname "$0")/.next/standalone" -name "server.js" | head -n 1)

if [ -z "$SERVER_PATH" ]; then
  echo "❌ Error: server.js not found. Check build output."
  exit 1
fi

echo "🚀 Starting server from: $SERVER_PATH"
exec node "$SERVER_PATH"
