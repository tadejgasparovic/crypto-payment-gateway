const debug = require('debug')('payment-gateway:notificationsCron');
const config = require('../config');

const Notification = require('../../models/notification.model').model;
const Payment = require('../../models/payment.model').model;

const PaymentEvents = require('../events/payment.emitter');

async function work()
{
	const notifications = await Notification.find({ sentAt: null, retries: { $lt: config.maxNotificationFailures } }).populate('payment').exec();

	debug(`Found ${notifications.length} failed notifications`);

	const promises = notifications.map(notification => new Promise((resolve, reject) => {
		if(typeof PaymentEvents[notification.type] === 'function')
		{
			PaymentEvents[notification.type](notification.payment, err => err ? reject(err) : resolve())
		}
		else reject(Error(`No event trigger function for '${notification.type}'`));
	}));

	await Promise.all(promises);
}

module.exports = work;