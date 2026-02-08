
module.exports = {
  apps: [{
    name: "tiger-erp",
    script: "./server.js",
    instances: 1, // Keep as 1 to ensure in-memory token cache consistency
    exec_mode: "fork",
    autorestart: true,
    watch: false, // Disable watch in production to prevent unexpected restarts
    max_memory_restart: '1G', // Restart if memory usage exceeds 1GB
    env: {
      NODE_ENV: "production",
      PORT: 3001
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    merge_logs: true
  }]
};
