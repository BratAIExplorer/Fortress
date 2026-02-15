module.exports = {
    apps: [
        {
            name: "fortress-app",
            script: ".next/standalone/server.js",
            // args: "start", // Not needed for standalone
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            env_production: {
                // PM2 will load these when you run with --env production
                // But .env.local usually overrides these
            },
            env_file: ".env.local",
            cwd: "/opt/fortress/app", // Explicit path on VPS
            // Optimization
            instances: 1, // Start with 1 instance to save RAM on VPS
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M", // Restart if memory exceeds 500MB
        },
    ],
};
