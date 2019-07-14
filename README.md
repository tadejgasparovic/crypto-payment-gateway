# Crypto Payment Gateway
Crypto payment gateway is a lightweight ReactJS & NodeJS payment processor designed to work with a large variety of crypto-currencies.

## Index
 - [Supported crypto-currencies](#supported-crypto-currencies)
 - [Modules](#modules)
   - [`payment-gateway`](#payment-gateway)
   - [`admin-panel`](#admin-panel)
   - [`checkout-frontend`](#wip-checkout-frontend)
   - [`client-portal`](#wip-client-portal)
 - [Configuration](#configuration)
 - [Docker](#docker)
   - [Container names](#container-names)
   - [Docker compose environment variables](#docker-compose-environment-variables)
 - [SSL](#ssl)
 - [Database](#database)
 - [Oulor dev daemon](#oculor-dev-daemon)

## Supported crypto-currencies
The system has been developed with Oculor (<https://oculor.io>) in mind, but it can hook into virtually any crypto-currency out there as long as it supports a couple basic JSON RPC commands and `walletnotify` (**TODO: Use blocknotify instead!**).
 - `getnewaddress` - used to generate a new payment address
 - `getrawtransaction` - used to retreive the full transaction received through `walletnotify`
 - `walletnotify` script should `POST` the JSON object `{ "txid": "<txid>", "currency": "<coin-symbol>" }` to the `https://payment-gateway/transactions` gateway API endpoint

## Modules
The gateway is composed of 4 separate projects / modules located in [modules/](modules).

### `payment-gateway`
This module is the brain of the system. It's a NodeJS backend service which serves a RESTful API used by all 3 other modules as well as 3rd party applications. [Payment gateway docs.](modules/payment-gateway)

### `admin-panel`
This is a frontend module built using ReactJS and Material UI. It offers the gateway operator easy management of the entire system. [Admin panel docs.](modules/admin-panel)

### [WIP] `checkout-frontend`
***This module is yet to be implemented in a future upgrade.***

This is a frontend module built using ReactJS and Material UI. It offers a checkout flow to developers who are looking for a fast way to incorporate crypto-currency payments into their application. The developer only needs to redirect the user to the checkout frontend with appropriate query values set and this module handles the rest. [Checkout frontend docs.](modules/checkout-frontend)

### [WIP] `client-portal`
***This module is yet to be implemented in a future upgrade.***

This is a frontend module built using ReactJS and Material UI. It's a portal for [crypto-currency proviers](modules/payment-gateway#client) and [merchants](modules/payment-gateway#merchant) to manage their crypto-currencies and view their earnings respectively.

## Configuration
All configuration files are located in [modules/config](modules/config).

The [payment gateway config](modules/config/gateway.config.js) can be edited at any time during runtime and the `payment-gateway` service will detect the changes automatically to allow for 100% availability. The other 3 projects on the other hand need to have their Docker container rebuilt in order to update their config values. This is because the config file needs to be bundled together with the rest of the app which doesn't take a trivial amount of time. Since the old container can continue running while the new one is being built, service interruption is minimized (a couple seconds at most).

## Docker
The entire payment gateway is designed to run under Docker. All Dockerfiles files can be found inside [docker/](docker) and `docker-compose.yml` is located in the root of this project.

Bringing up the containers requires multiple environment variables to be set. To make setting these variables easier for development purposes you can use `up.sh` found in the root of this project. The comment in the begining of the script provides a working example command you can simply copy-paste into your terminal and bring up all required containers, 0 configuration required (provided you have generated the required [SSL certificates](#ssl)). To stop all containers you can use the helper script `down.sh`.

### Container names
All container names follow the naming convention: `crypto-payment-gateway_<service-name>_<build-env>`
where `<build-env>` is the value of the `BUILD_ENV` [environment variable](#docker-compose-environment-variables).

### Docker compose environment variables
List of all environment variables supported by `docker-compose.yml`.

| Variable             | Description                             | Required |
|----------------------|-----------------------------------------|:--------:|
| BUILD_ENV            | `production` or `development`           | Yes      |
| CONFIG_DIR           | Usually `./modules/config/`             | Yes      |
| SSL_CERT             | SSL cert in PEM format                  | Yes      |
| SSL_KEY              | SSL private key in PEM formats          | Yes      |
| MONGO_DATA           | MongoDB data volume. [More.](#database) | Yes      |
| GATEWAY_PORT_PLAIN   | Gateway API HTTP port                   | Yes      |
| GATEWAY_PORT_SECURE  | Gateway API HTTPS port                  | Yes      |
| ADMIN_PORT_PLAIN     | Admin panel HTTP port                   | Yes      |
| ADMIN_PORT_SECURE    | Admin panel HTTPS port                  | Yes      |
| PORTAL_PORT_PLAIN    | Client portal HTTP port                 | Yes      |
| PORTAL_PORT_SECURE   | Client portal HTTPS port                | Yes      |
| FRONTEND_PORT_PLAIN  | Checkout frontend HTTP port             | Yes      |
| FRONTEND_PORT_SECURE | Checkout frontend HTTPS port            | Yes      |

## SSL
The SSL certificate can be copied into [modules/ssl/](modules/ssl) or generated using the [`genssl.sh`](modules/ssl/genssl.sh) script (**for development only!**). If the certificate is located elsewhere on the system it can still be linked into the project by passing the relavant paths to `up.sh`.

## Database
The gateway uses MongoDB as it's database. To provide persistance data storage the MongoDB container requires a data volume. The local directory you wish to use as the Mongo data volume can be passed to `up.sh` or set in an environment variable just like [SSL cert paths](#ssl).

## Oculor dev daemon
Inside [`oculor-dev-daemon/`](oculor-dev-daemon) is a test Oculor daemon with a Dockerfile you can use for quickly spinning up an Oculor daemon if needed during development. The daemon listens on port `48844` on all interfaces and accepts all connections (**covenient for development but unsafe for production!**). It accepts the username `oculor` and password `oculor-dev`. To start it simply run [`./oculor-dev-daemon/up.sh`](oculor-dev-daemon/up.sh).