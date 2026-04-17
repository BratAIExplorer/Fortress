module.exports = {
    apps: [
        {
            name: "fortress-app",
            script: "server.js",
            cwd: "/opt/fortress/.next/standalone",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            env_file: "/opt/fortress/.env.local",
            // Optimization
            instances: 1, // Start with 1 instance to save RAM on VPS
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M", // Restart if memory exceeds 500MB
        },
        // ════════════════════════════════════════════════════════════════
        // CRON JOBS: Automated data refresh for Investment Genie
        // ════════════════════════════════════════════════════════════════

        {
            name: "cron-scanner",
            script: "/opt/fortress/cron/scanner.js",
            cron_time: "0 2 * * *", // 2 AM IST daily
            autorestart: false,
            watch: false,
            env: {
                NODE_ENV: "production",
                CRON_SECRET: process.env.CRON_SECRET || "dev-secret",
            },
            env_file: "/opt/fortress/.env.local",
            max_memory_restart: "300M",
            error_file: "/var/log/fortress/cron-scanner-error.log",
            out_file: "/var/log/fortress/cron-scanner.log",
        },

        {
            name: "cron-macro",
            script: "/opt/fortress/cron/macro.js",
            cron_time: "0 20 * * *", // 8 PM IST daily
            autorestart: false,
            watch: false,
            env: {
                NODE_ENV: "production",
                CRON_SECRET: process.env.CRON_SECRET || "dev-secret",
            },
            env_file: "/opt/fortress/.env.local",
            max_memory_restart: "300M",
            error_file: "/var/log/fortress/cron-macro-error.log",
            out_file: "/var/log/fortress/cron-macro.log",
        },

        {
            name: "cron-intelligence",
            script: "/opt/fortress/cron/intelligence.js",
            cron_time: "30 20 * * *", // 8:30 PM IST daily
            autorestart: false,
            watch: false,
            env: {
                NODE_ENV: "production",
                CRON_SECRET: process.env.CRON_SECRET || "dev-secret",
            },
            env_file: "/opt/fortress/.env.local",
            max_memory_restart: "300M",
            error_file: "/var/log/fortress/cron-intelligence-error.log",
            out_file: "/var/log/fortress/cron-intelligence.log",
        },
    ],
};
