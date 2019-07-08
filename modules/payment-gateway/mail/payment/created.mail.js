const config = require('../../src/config');

module.exports = (to, { _id, address, amount, currency, expiry }) => ({
	to,
	subject: `Payment ${_id} has been created`,
	text: `Payment ${_id} has been created. Please send ${amount} ${currency} to ${address} before ${expiry} UTC.\n` +
			`Payments received after this date or with a value lower than ${amount} ${currency} will be ignored.\n` +
			`Your payment will be accepted after it receives at least ${config.requiredConfirmations} confirmations.`
});