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
    ],
};
