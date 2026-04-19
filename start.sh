#!/bin/bash
# Load env vars and start the Next.js standalone server.
# Required because standalone mode does not auto-read .env.local.
set -a
source "$(dirname "$0")/.env.local"
set +a
exec node "$(dirname "$0")/.next/standalone/server.js"
