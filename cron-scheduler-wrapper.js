// Load .env.production first, then start the scheduler
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.production
const envFile = path.join(process.cwd(), '.env.production');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        process.env[key] = value;
        if (key === 'CRON_SECRET') {
          console.log(`[wrapper] Loaded CRON_SECRET from .env.production: ${value.substring(0, 20)}...`);
        }
      }
    }
  });
}

// Verify CRON_SECRET is loaded
if (!process.env.CRON_SECRET) {
  console.error('[wrapper] ERROR: CRON_SECRET still not found after loading .env.production');
  console.error('[wrapper] File exists:', fs.existsSync(envFile));
  if (fs.existsSync(envFile)) {
    console.error('[wrapper] File content (last 5 lines):');
    const content = fs.readFileSync(envFile, 'utf-8').split('\n');
    content.slice(-5).forEach(line => console.error('  ' + line));
  }
}

// Now start the cron scheduler
require('./cron-scheduler.js');
