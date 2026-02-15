module.exports = {
    apps: [
        {
            name: "fortress-app",
            script: "server.js",
            cwd: "/opt/fortress/app/.next/standalone",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                // The env_file should ideally load these, but we'll try an alternative
                // strategy if it keeps failing.
            },
            env_file: "/opt/fortress/app/.env",
            // Optimization
            instances: 1, // Start with 1 instance to save RAM on VPS
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M", // Restart if memory exceeds 500MB
        },
    ],
};
