const config = require('../../src/config');

module.exports = (to, id) => ({
	to,
	subject: `Payment ${id} has been finalized`,
	text: `Your transaction for payment ${id} has been confirmed.`
});