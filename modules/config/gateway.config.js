module.exports = {

	/* GENERAL */
	dateFormat: "MM/dd/yyyy hh:mm:ss",

	/* HTTP & HTTPS */
	host: "127.0.0.1:3200", // IP or domain name of the gateway including HTTPS port (if non-standard)

	/* DB CONNECTION */
	dbPort: null, // null = default: 27017
	dbHost: "database", // null = default: 127.0.0.1

	/* COIN CONNECTION */
	enabledAdapters: null, // null = default: [ 'rpc' ]
	txPushSecret: "w3r4t5zr4t5zthj", // Requests to the wallet notify /transactions endpoint must provide this secret token for the submitted TXID to be accepted

	/* PAYMENTS */
	paymentWindowMins: 15, // Payment window in minutes. After this window the payment will be automatically canceled
	requiredConfirmations: 14, // Number of required confirmations the TX needs to receive before the payment is accepted
	maxStatusHookFailures: 10, // Max. number of allowed failed status hook attempts. After this many attempts the gateway will no longer attempt to contact the hook.
	maxNotificationFailures: 10, // Max. number of allowed failed notifications. After this many attempts the gateway will no longer attempt to resend the failed notification.

	/* CRON JOBS */
	cronJobPeriods: {
		expiry: 2, // Check for expired payments every 2 mins
		notifications: 1, // Check for any failed notifications and attempt to resend them every minute
		expiredHooks: 5 // Check for any failed status hooks and attempt to resend them every 5 mins
	},

	/* EMAIL */
	// The gateway uses the `nodemailer` package to deliver emails.
	// This object is passed directly to `nodemailer.createTransport()`.
	// https://nodemailer.com/smtp/
	smtpTransport: {
		host: "smtp.mailtrap.io",
		port: 2525,
		auth: {
			user: "ff4941754dd790",
			pass: "22074d0e70194f"
		}
	},

	// These defaults are merged with each email object exported by mail modules found in `mail/`.
	// These options are defaults and can thus be overridden by each mail module.
	mailDefaults: {
		from: "Payment Gateway <payment@gateway.test>",
		subject: "Payment status update"
	}
};
