#!/bin/bash
DEBUG=payment-gateway:* /usr/local/bin/node /payment-gateway/src/jobs/index.js &>> /var/log/gateway.log
