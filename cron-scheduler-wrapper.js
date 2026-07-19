// Load .env.production first, then start the scheduler
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.production
const envFile = path.join(process.cwd(), '.env.production');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

// Now start the cron scheduler
require('./cron-scheduler.js');
