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
    // ponytail: "fortress-bot" (this app was a Session 37 rewrite/consolidation
    // attempt) intentionally disabled July 30, 2026 — it ran in parallel with
    // the real bot (pm2 "macd-bot", /opt/macd-bot) and posted to the SAME
    // /api/analysis/momentum-signals endpoint every 5 minutes. Its
    // send_telegram_alert()/execute_zerodha_trades() were unimplemented stubs
    // (log a line, do nothing) and it has no Weekly-timeframe logic at all —
    // it isn't a real alternative, just a leftover. Worse: it posted an EMPTY
    // signal list on most cycles, and since the API does delete-then-reinsert,
    // it was silently wiping out real signals the actual bot had just written
    // — the root cause of "Telegram alerts fired but the DB/UI showed nothing"
    // investigated on July 30. Re-enable only after either finishing this
    // rewrite properly (Weekly support, real Telegram/Zerodha) and retiring
    // the old bot, or deleting this block for good — never run both at once.
    // {
    //   name: "fortress-bot",
    //   script: "macd_excel_bot.py",
    //   interpreter: "python3",
    //   instances: 1,
    //   exec_mode: "fork",
    //   watch: false,
    //   cwd: "/opt/fortress/scripts/macd-bot",
    //   env: {
    //     TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    //     TELEGRAM_ADMIN_ID: process.env.TELEGRAM_ADMIN_ID,
    //     FORTRESS_API_URL: process.env.FORTRESS_API_URL,
    //     CRON_SECRET: process.env.CRON_SECRET,
    //     ZERODHA_API_KEY: process.env.ZERODHA_API_KEY,
    //     ZERODHA_API_SECRET: process.env.ZERODHA_API_SECRET,
    //     ZERODHA_CLIENT_ID: process.env.ZERODHA_CLIENT_ID,
    //   },
    //   error_file: "/var/log/fortress/bot-error.log",
    //   out_file: "/var/log/fortress/bot-out.log",
    //   log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    //   restart_delay: 4000,
    //   max_restarts: 10,
    //   min_uptime: "10s",
    // },
  ],
};
