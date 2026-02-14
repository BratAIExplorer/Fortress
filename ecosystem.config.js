module.exports = {
    apps: [
        {
            name: "fortress-app",
            script: ".next/standalone/server.js",
            // args: "start", // Not needed for standalone
            env: {
                NODE_ENV: "production",
                PORT: 3000, // Explicitly set port for this app
            },
            // Error handling and logging
            error_file: "./logs/err.log",
            out_file: "./logs/out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss",
            cwd: ".", // Ensure we are in the project root
            env_file: ".env.local", // Load environment variables from this file
            // Optimization
            instances: 1, // Start with 1 instance to save RAM on VPS
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "500M", // Restart if memory exceeds 500MB
        },
    ],
};
