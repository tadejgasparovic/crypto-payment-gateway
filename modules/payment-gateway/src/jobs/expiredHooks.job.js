const debug = require('debug')('payment-gateway:expiredHooksCron');
const config = require('../config');

const StatusHook = require('../../models/statusHook.model').model;

const PaymentEvents = require('../events/payment.emitter');

async function work()
{
	const failedHooks = await StatusHook.find({ statusCode: { $ne: 200 }, retries: { $lt: config.maxStatusHookFailures } })
										.populate('payment')
										.exec();

	debug(`Found ${failedHooks.length} failed hooks`);

	const promisifyEvent = ({ type, payment }) => new Promise((resolve, reject) => {
		PaymentEvents[type](payment, err => err ? reject(err) : resolve());
	});

	const promises = failedHooks.map(promisifyEvent);

	await Promise.all(promises);
}

module.exports = work;