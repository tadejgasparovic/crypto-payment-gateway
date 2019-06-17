const config = require('../../src/config');

module.exports = (to, id) => ({
	to,
	subject: `Payment ${id} has expired`,
	text: `Payment ${id} has expired. Any funds sent to the payment address will be ignored.`
});