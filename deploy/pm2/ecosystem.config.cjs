module.exports = {
  apps: [
    {
      name: 'forever-backend',
      cwd: '/opt/forever/backend',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};

