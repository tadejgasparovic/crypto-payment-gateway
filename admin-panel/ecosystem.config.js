module.exports = {
  apps : [{
    name: 'admin-panel',
    script: 'bin/www',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      DEBUG: 'admin-panel:*'
    },
    env_production: {
      NODE_ENV: 'production',
      DEBUG: 'admin-panel:*'
    }
  }]
};
