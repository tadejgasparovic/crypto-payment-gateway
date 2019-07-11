# Payment gateway
This is the primary gateway REST API every other service talks to (incuding 3rd party services). It offers payment, management, and authentication endpoints.

## Index
 - [Cron jobs](#cron-jobs)
   - [Expiry.job](#expiryjob)
   - [Notifications.job](#notificationsjob)
 - [Payments](#payments)
   - [Create a payment](#create-a-payment)
     - [Request](#request)
     - [Response](#response)
   - [Poll a payment](#poll-a-payment)
     - [Request](#request-1)
     - [Response](#response-1)
   - [List payments](#list-payments)
     - [Request](#request-2)
     - [Response](#response-2)
   - [Submitting crypto transactions](#submitting-crypto-transactions)
     - [Request](#request-3)
     - [Response](#response-3)
 - [Management](#management)
   - [Endpoints](#endpoints)
 - [Authentication](#authentication)
   - [Login endpoint](#login-endpoint)
     - [Request](#request-4)
     - [Response](#response-4)
   - [Token check endpoint](#token-check-endpoint)
     - [Request](#request-5)
     - [Response](#response-5)
   - [Account types](#account-types)
     - [Admin](#admin)
     - [Client](#client)
     - [Merchant](#merchant)
 - [Events](#events)
 - [Notifications](#notifications)
   - [Email](#email)
 - [Development](#development)
 - [Testing](#testing)
 - [Docker](#docker)

## Cron jobs
The gateway provides multiple cron jobs required for normal operation of the service. They can be found in [`src/jobs/`](src/jobs).
All jobs can be configured in the config and started by executing [`src/jobs/index.js`](src/jobs/index.js).

### Expiry.job
This cron job is in charge of triggering `payment.expired` events (which trigger respective email ntifications).

### Notifications.job
This cron job is in charge of attempting to resend failed email notifications.

## Payments
The two main endpoints responsible for payments are:
 - `/payments/:id?` - Endpoint used for creating and polling payments
 - `/transactions` - `walletnotify` should POST the TXID here

### Create a payment

#### Request
**Method:** `POST`

**API endpoint:** `/payments`

**Request headers:** `Content-Type: application/json`

**Request body:**

```javascript
{
	"merchantId": "<merchantId>", // Required. ID of the merchant receiving the payment
	"currency": "<coinSymbol>", // Required. Payment crypto-currency symbol
	"amount": "<amount>", // Required. Amount to be paid in the target crypto-currency
	"customerEmail": "<customerEmail>", // Required. Customer email for notifications
	"statusHook": "<httpHook>" // Optional. Web hook which will receive payment status change notifications
}
```

#### Response

**Error responses:**

| Status code | Body                           | Description                                      |
|:-----------:|--------------------------------|--------------------------------------------------|
| 400         | `{ "error": "error_message" }` | Validation error                                 |
| 403         | `Unauthorized`                 | Invalid merchant ID                              |
| 404         | `Not Found`                    | Currency doesn't exist                           |
| 500         | `Internal Error`               | General failure. Most likely DB connection issue |

**200 OK response:**
```javascript
{
	"_id": "<paymentId>", // ID of the newly created payment
	"currency": "<coinSymbol>", // Payment crypto-currency symbol
	"amount": "<amount>", // Amount to be paid in the target crypto-currency
	"customerEmail": "<customerEmail>", // Customer email for notifications
	"address": "<paymentAddress>", // Address to which the payment should be made
	"confirmations": 0, // Number of confirmations the payment has. This value is always 0 for new payments
	"createdAt": "<createdAt>", // ISO 8601 formatted timestamp. Date & time when the payment was created
	"expiresAt": "<expirationDate>", // ISO 8601 formatted timestamp. Date & time when the payment expires
	"receivedAt": "<receivedAt>", // ISO 8601 formatted timestamp. Date & time when the crypto TX was initially received. Initially null
	"paidAt": "<paidAt>" // ISO 8601 formatted timestamp. Date & time when the crypto TX was fully confirmed: Initially null
}
```

### Poll a payment

This endpoint can be used to poll a payment status for applications which can't or don't want to use a `statusHook`.

#### Request
**Method:** `GET`

**API Endpoint:** `/payments/:id`

**Params:** `id - Payment ID`

#### Response

**Error responses:**

| Status code | Body                           | Description                                      |
|:-----------:|--------------------------------|--------------------------------------------------|
| 400         | `{ "error": "error_message" }` | Validation error                                 |
| 404         | `Not Found`                    | Payment doesn't exist                            |
| 500         | `Internal Error`               | General failure. Most likely DB connection issue |

**200 OK response:**

***Identical to the [create payment](#create-a-payment) response.***

### List payments

> **IMPORTANT:** This endpoint requires a valid admin token! [Read more.](#authentication)

#### Request
**Method:** `GET`

**API Endpoint:** `/payments`

**Request headers:** `Authorization: Bearer <token>`

#### Response

**Error responses:**

| Status code | Body                           | Description                                      |
|:-----------:|--------------------------------|--------------------------------------------------|
| 403         | `Unauthorized`                 | Authentication error                             |
| 404         | `Not Found`                    | Payment doesn't exist                            |
| 500         | `Internal Error`               | General failure. Most likely DB connection issue |

**200 OK response:**

***An array of [create payment](#create-a-payment) responses with the additional field `merchant` containing the ID of the merchant the payment has been made to.***

### Submitting crypto trasactions

> `walletnotify` should POST to this endpoint.

#### Request
**Method:** `POST`

**API Endpoint:** `/transactions`

**Request headers:** `Content-Type: application/json`

**Request body:**
```javascript
{
	"txid": "<txId>", // The transaction pushed to `walletnotify` / TX that'll be checked for deposits
	"currency": "<currencySymbol>" // Symbol of the currency the TX belongs to
}
```

#### Response

| Status code | Body                           | Description                                      |
|:-----------:|--------------------------------|--------------------------------------------------|
| 400         | `{ "error": "error_message" }` | Validation error                                 |
| 404         | `Not Found`                    | Currency doesn't exist                           |
| 500         | `Internal Error`               | General failure. Most likely DB connection issue |
| 200         | `OK`                           | Success                                          |

## Management
*These endpoints are primarily used by the admin panel.*

> **IMPORTANT:** These endpoints can only be accessed with an admin token (with a few exceptions mentioned next to the respective endpoints)!

All of these endpoints are CRUD (**C**reate **R**ead **U**pdate **D**elete) endpoints and follow the same rules.

| Operation | Method   | Endpoint format  | Description                                                                                                                        |
|:---------:|:--------:|:----------------:|------------------------------------------------------------------------------------------------------------------------------------|
| `CREATE`  | `POST`   | `/endpoint`      | POST data to the endpoint root to create a new entry                                                                               |
| `READ`    | `GET`    | `/endpoint/:id?` | Returns an array of models (if `:id` isn't preset) or a single model. Pass query `?raw=1` to return model IDs instead of usernames |
| `UPDATE`  | `POST`   | `/endpoint/:id`  | POST data to the endpoint suffixed with the model ID to update the data                                                            |
| `DELETE`  | `DELETE` | `/endpoint/:id`  | Deletes a model with ID `:id`                                                                                                      |

> `:id` can be a 24 byte hexadecimal ID or model specific unique identifier (`username` for accounts and `symbol` for coins)

Additionally, each request must include the `Authorization: Bearer <token>` header and `POST` requests must include the `Content-Type: application/json` header.

### Endpoints
 - `/coins` - Crypto-currency management
   - Can be managed by admins and clients
 - `/clients` - Client management
   - Can be **updated** by admins and clients (aka password change)
 - `/merchants` - Merchant management
   - Can be **updated** by admins and merchants (aka password change)
 - `/admins` - Admin management

## Authentication
The payment gateway API also offers authentication. The two authentication endpoints are:

| Method | Endpoint      | Description          |
|:------:|:-------------:|----------------------|
| `POST` | `/auth`       | Login endpoint       |
| `GET`  | `/auth/check` | Token check endpoint |

### Login endpoint

#### Request
**Request headers:** `Content-Type: application/json`

**Request body:**
```javascript
{
	"username": "<username>",
	"password": "<password>",
	"type": "<accountType>" // Enum: [ 'admin', 'merchant', 'client' ]
}
```
#### Response

**Error responses:**

| Status code | Body                           | Description                                      |
|:-----------:|--------------------------------|--------------------------------------------------|
| 400         | `{ "error": "error_message" }` | Validation error                                 |
| 403         | `Unauthorized`                 | Incorrect username or password                   |
| 500         | `Internal Error`               | General failure. Most likely DB connection issue |

**200 OK response:**
```javascript
{
	"token": "<token>"
}
```

### Token check endpoint

#### Request
**Request headers:** `Authorization: Bearer <token>`

#### Response

**Error responses:**

| Status code | Body                           | Description                                      |
|:-----------:|--------------------------------|--------------------------------------------------|
| 500         | `Internal Error`               | General failure. Most likely DB connection issue |

**200 OK response:**

***Identical to the [create payment](#create-a-payment) response.***

### Account Types
The gateway supports 3 account types.

#### Admin
Administrator is the highest privilege account type. It grants access to the admin panel where the entire gateway can be controlled.

#### Client
Clients or crypto-currency providers are 3rd parties who wish to offer their crypto-currency on the gateway. Only client accounts can own coins.

#### Merchant
Merchants are 3rd parties who wish to accept payments through the gateway.

## Events
The gateway provides an easy way of hooking into, and triggering, payment events. The event emitter [`src/events/payment.emitter.js`](src/events/payment.emitter.js) provides the following events:

| Event          | Emitted when                                                                                 |
|:--------------:|----------------------------------------------------------------------------------------------|
| `created`      | A new payment is created                                                                     |
| `received`     | Crypto TX initially received                                                                 |
| `confirmation` | Crypto TX received a confirmation                                                            |
| `finalized`    | Crypto TX receives the minimum required confirmations                                        |
| `expired`      | Payment expires (emitted by the [expiry cron job](#expiryjob))                               |
| `looseFunds`   | Crypto TX received for an expired payment, finalized payment, or with an insufficient amount |

## Notifications
When the [notification module](src/notifications.js) is loaded it registers listeners for `created`, `received`, `finalized`, and `expired` events and exports an `unhook()` function which removes all event listeners.

### Email
Currently email is the only supported notification channel. The transport can be configured in the [configuration file](../config/gateway.config.js) using [`nodemailer`](https://nodemailer.com/smtp/) options.

## Development
To start the payment gateway development server run `npm start` in the project root. Your environment ***must*** have the variable `CONFIG` set (`../config/gateway.config.js` in a normal setup). The payment gateway uses the [`debug` module](https://www.npmjs.com/package/debug) which accepts a `DEBUG` environment variable to control which debug messages get logged.

> Quick start: `DEBUG=payment-gateway:* CONFIG=../config/gateway.config.js npm start`

## Testing
The payment gateway API uses Jest as the testing framework of choice. To run the tests run `npm test`. Same environment variables apply as with the [development server](#development).

## Docker
The payment gateway [Dockerfile](../../docker/payment-gateway/Dockerfile) requires a single build argument. `BUILD_ENV` ***must*** contain the current build environment (`production` or `development`).