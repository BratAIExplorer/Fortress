#!/bin/bash
cd "$(dirname "$0")"
npm ci --production
npm run build
pm2 start ecosystem.config.js --update-env
