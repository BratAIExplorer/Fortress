const path = require('path');

module.exports = {
  apps: [{
    name: 'fortress',
    script: path.join(__dirname, 'start.sh'),
    cwd: __dirname,
    restart_delay: 3000,
    max_restarts: 10,
    autorestart: true,
  }]
};
