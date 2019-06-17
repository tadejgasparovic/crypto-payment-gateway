#!/bin/sh

# E.g. ./up.sh dev ./config/ ./ssl/default.cert ./ssl/default.key ./db 3100 3200 3101 3201 3102 3202 3103 3203

usage()
{
	echo "Invalid number of arguments!"
	echo "Usage: $0 <build_env> <config_dir> <ssl_cert> ..."
	echo "Required arguments (order is important!):"
	echo "build_env - prod | dev"
	echo "config_dir - Path to the configuration directory"
	echo "ssl_cert - Path to the SSL certificate file"
	echo "ssl_key - Path to the SSL key file"
	echo "mongo_data - Path to MongoDB data volume"
	echo "gateway_port_plain - HTTP port for the gateway API"
	echo "gateway_port_secure - HTTPS port for the gateway API"
	echo "potal_port_plain - HTTP port for the client portal"
	echo "potal_port_secure - HTTPS port for the client portal"
	echo "admin_port_plain - HTTP port for the admin panel"
	echo "admin_port_secure - HTTPS port for the admin panel"
	echo "frontend_port_plain - HTTP port for the frontend"
	echo "frontend_port_secure - HTTPS port for the frontend"
	exit
}

if [ "$#" -ne 13 ];
then
	usage
fi

if [ "$1" != "dev" -a "$1" != "prod" ];
then
	usage
fi

if [ "$1" = "prod" ];
then
	export BUILD_ENV="production"
else
	export BUILD_ENV="development"
fi

export CONFIG_DIR="$2"
export SSL_CERT="$3"
export SSL_KEY="$4"
export MONGO_DATA="$5"
export GATEWAY_PORT_PLAIN="$6"
export GATEWAY_PORT_SECURE="$7"
export PORTAL_PORT_PLAIN="$8"
export PORTAL_PORT_SECURE="$9"
export ADMIN_PORT_PLAIN="$10"
export ADMIN_PORT_SECURE="$11"
export FRONTEND_PORT_PLAIN="$12"
export FRONTEND_PORT_SECURE="$13"

docker-compose -p crypto-payment-gateway_$BUILD_ENV up --build -d
