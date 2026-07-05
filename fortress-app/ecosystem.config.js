module.exports = {
  apps: [
    {
      name: 'fortress-app',
      script: '.next/standalone/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
