const config = require('../../src/config');

module.exports = (to, id) => ({
	to,
	subject: `Transaction for payment ${id} has been received`,
	text: `We have received your transaction for payment ${id}. After the transaction receives ${config.requiredConfirmations} confirmations you'll receive a confirmation email.`
});