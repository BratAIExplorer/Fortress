// Load .env.production once here so PM2 has CRON_SECRET (and anything else
// added on the server) available when it parses the app env blocks below.
// Prevents PM2 process registrations from silently drifting out of sync with
// what's actually in the env file (see: cron-scheduler-wrapper.js incident).
// ponytail: hand-rolled KEY=VALUE parser instead of the dotenv package --
// it's 5 lines, not worth a dependency for.
const fs = require("fs");
const path = require("path");
const envFile = path.join(__dirname, ".env.production");
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, "utf-8").split("\n").forEach((line) => {
    const trimmed = line.trim();
    const eq = trimmed.indexOf("=");
    if (eq > 0 && !trimmed.startsWith("#")) {
      process.env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
    }
  });
}

module.exports = {
  apps: [
    {
      name: "fortress-app",
      script: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/fortress/error.log",
      out_file: "/var/log/fortress/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      ignore_watch: ["node_modules", ".next"],
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
    },
    {
      name: "fortress-cron",
      script: "cron-scheduler.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
        SCANNER_BASE_URL: "http://localhost:3000",
        CRON_SECRET: process.env.CRON_SECRET,
      },
      error_file: "/var/log/fortress/cron-error.log",
      out_file: "/var/log/fortress/cron-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
