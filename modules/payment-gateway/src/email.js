const nodemailer = require('nodemailer');
const debug = require('debug')('payment-gateway:email');

const config = require('./config');

const transport = nodemailer.createTransport(config.smtpTransport || {});

function sendMail(mail, to, options)
{
	const email = {
		...config.mailDefaults,
		...(require(`../mail/${mail}.mail`) || (() => ({})))(to, options)
	};

	return transport.sendMail(email);
}

sendMail.verify = async () => {
	try
	{
		await Promise.race([
			transport.verify(),
			new Promise((resolve, reject) => setTimeout(() => reject(Error("No response for 20 seconds! Assuming SMTP configuration is invalid.")), 20000)),
		]);
		debug("SMTP transport valid!");
	}
	catch(e)
	{
		debug(`SMTP transport verification failed. ${e}`);
		throw e;
	}
}

module.exports = sendMail;