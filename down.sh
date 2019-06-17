#!/bin/sh

usage()
{
	echo "Usage: $0 prod | dev [rm]"
	echo "rm - [Optional] Remove stopped containers"
	exit
}

if [ -z "$1" -o "$1" != "dev" -a "$1" != "prod" ];
then
	usage
fi

if [ "$1" = "prod" ];
then
	export BUILD_ENV="production"
else
	export BUILD_ENV="development"
fi

# Fill environment variables with dummy values so `docker-compose down` doesn't complain
export CONFIG_DIR="./config"
export SSL_CERT="./ssl/tmp.cert"
export SSL_KEY="./ssl/tmp.cert"
export MONGO_DATA="./db"
export GATEWAY_PORT_PLAIN="3000"
export GATEWAY_PORT_SECURE="3443"
export PORTAL_PORT_PLAIN="3000"
export PORTAL_PORT_SECURE="3443"
export ADMIN_PORT_PLAIN="3000"
export ADMIN_PORT_SECURE="3443"
export FRONTEND_PORT_PLAIN="3000"
export FRONTEND_PORT_SECURE="3443"

docker-compose -p crypto-payment-gateway_$BUILD_ENV down

if [ -n "$2" -a "$2" = "rm" ];
then
	docker-compose -p crypto-payment-gateway_$BUILD_ENV rm
fi