#!/bin/sh
pm2-runtime start ecosystem.config.js --env ${BUILD_ENV}