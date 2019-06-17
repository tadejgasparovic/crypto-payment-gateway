const formatDate = require('date-format');
const debug = require('debug')('payment-gateway:notifications');

const Notification = require('../models/notification.model').model;

const mail = require('./email');
const PaymentEvents = require('./events/payment.emitter');
const config = require('./config');

const handle = (payment, type, cb, error = false) => () => {
	Notification.findOne({ payment }).exec().then(notification => {

		if(!notification)
		{
			notification = new Notification({ payment, type });
		}

		if(!error) notification.sentAt = Date.now();

		return notification.save();
	})
	.then(() => cb && cb())
	.catch((e = Error()) => debug(e) || (cb && cb(e)));
}

const onCreated = ({ _id, customerEmail, address, amount, currency, expiresAt }, cb) => {
	debug(`Sending notification for payment ${_id} event 'created'`);
	mail('payment/created', customerEmail, { _id, address, amount, currency, expiry: formatDate(config.dateFormat, expiresAt) }).then(handle(_id, 'created', cb)).catch(handle(_id, 'created', cb, true));
}

const onReceived = ({ _id, customerEmail }, cb) => {
	debug(`Sending notification for payment ${_id} event 'received'`);
	mail('payment/received', customerEmail, _id).then(handle(_id, 'received', cb)).catch(handle(_id, 'received', cb, true));
}

const onFinalized = ({ _id, customerEmail }, cb) => {
	debug(`Sending notification for payment ${_id} event 'finalized'`);
	mail('payment/finalized', customerEmail, _id).then(handle(_id, 'finalized', cb)).catch(handle(_id, 'finalized', cb, true));
}

const onExpired = ({ _id, customerEmail }, cb) => {
	debug(`Sending notification for payment ${_id} event 'expired'`);
	mail('payment/expired', customerEmail, _id).then(handle(_id, 'expired', cb)).catch(handle(_id, 'expired', cb, true));
}

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