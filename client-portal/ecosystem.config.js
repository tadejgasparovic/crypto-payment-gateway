module.exports = {
  apps : [{
    name: 'client-portal',
    script: 'bin/www',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '100M',
    env: {
      NODE_ENV: 'development',
      DEBUG: 'client-portal:*'
    },
    env_production: {
      NODE_ENV: 'production',
      DEBUG: 'client-portal:*'
    }
  }]
};
