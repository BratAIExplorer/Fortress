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
  ],
};
