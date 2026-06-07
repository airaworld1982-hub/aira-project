// ═══════════════════════════════════════════════════════════
// PM2 Ecosystem Config — AIRA Nepal VPS
// Usage: pm2 start ecosystem.config.js
// ═══════════════════════════════════════════════════════════

module.exports = {
  apps: [
    {
      name:         'aira-backend',
      script:       './backend/server.js',
      cwd:          '/var/www/aira',
      instances:    1,              // 1 instance for 2GB VPS
      exec_mode:    'fork',
      watch:        false,
      max_memory_restart: '700M',   // restart if RAM exceeds 700MB

      env_production: {
        NODE_ENV:    'production',
        PORT:        3001,
      },

      // Logging
      error_file:   '/var/www/aira/logs/pm2-error.log',
      out_file:     '/var/www/aira/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:   true,

      // Auto restart settings
      autorestart:  true,
      restart_delay: 5000,   // wait 5s before restart
      max_restarts: 10,

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready:   false,
    }
  ]
};
