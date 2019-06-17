#!/bin/sh
docker run -ti -v /home/tadej/Upwork/crypto-payment-gateway/oculor-dev-daemon/oculor_data:/oculor/oculor_data -p 48844:48844 da6e5991015f $@
