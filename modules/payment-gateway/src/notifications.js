const formatDate = require('date-format');
const debug = require('debug')('payment-gateway:notifications');

const Notification = require('../models/notification.model').model;

const mail = require('./email');
const PaymentEvents = require('./events/payment.emitter');
const config = require('./config');

const saveNotification = (notification, cb, error = false) => {
	if(!error) notification.sentAt = new Date();
	else notification.retries++;

		notification.save()
			.then(() => cb && cb())
			.catch((e = Error()) => debug(e) || (cb && cb(e)));
}

const makeMailBody = (event, { _id, address, amount, currency, expiresAt }) => {
	switch(event)
	{
		case 'created':
			return {
					_id,
					address,
					amount,
					currency,
					expiry: formatDate(config.dateFormat, expiresAt)
				};
		default:
			return _id;
	}
}

const makeListener = event => (payment, cb) => {

	Notification.findOne({ payment: payment._id, type: event }).exec().then(notification => {

		if(!notification)
		{
			notification = new Notification({ payment: payment._id, type: event });
		}

		if(notification.sentAt) return;

		debug(`Sending notification for payment ${payment._id} event '${event}'`);

		mail(`payment/${event}`, payment.customerEmail, makeMailBody(event, payment))
			.then(() => saveNotification(notification, cb))
			.catch(() => saveNotification(notification, cb, true));
	})
	.catch(err => {
		debug(err);
		cb && cb();
	});
}

const onCreated = makeListener('created');
const onReceived = makeListener('received');
const onFinalized = makeListener('finalized');
const onExpired = makeListener('expired');

PaymentEvents.on('created', onCreated);
PaymentEvents.on('received', onReceived);
PaymentEvents.on('finalized', onFinalized);
PaymentEvents.on('expired', onExpired);

debug("Registered notification event handlers!");

module.exports = () => {
	PaymentEvents.removeListener('created', onCreated);
	PaymentEvents.removeListener('received', onReceived);
	PaymentEvents.removeListener('finalized', onFinalized);
	PaymentEvents.removeListener('expired', onExpired);
}