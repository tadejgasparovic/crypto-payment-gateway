#!/bin/bash
cron
pm2-runtime start ecosystem.config.js --env $1