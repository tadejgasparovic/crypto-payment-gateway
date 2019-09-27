#!/bin/bash
./dev.sh
docker exec -ti crypto-payment-gateway_payment-gateway_development tail -F /var/log/gateway.log
