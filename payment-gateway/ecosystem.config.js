module.exports = {
  apps : [{
    name: 'payment-gateway',
    script: 'bin/www',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    watch: true,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'development',
      DEBUG: 'payment-gateway:*'
    },
    env_production: {
      NODE_ENV: 'production',
      DEBUG: 'payment-gateway:*'
    }
  }]
};
