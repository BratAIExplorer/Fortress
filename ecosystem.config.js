module.exports = {
    apps: [
        {
            name: "fortress-app",
            script: ".next/standalone/server.js",
            cwd: "/opt/fortress/app",
            env_file: "/opt/fortress/app/.env",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            // Optimization
            instances: 1, // Start with 1 instance to save RAM on VPS
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M", // Restart if memory exceeds 500MB
        },
    ],
};
