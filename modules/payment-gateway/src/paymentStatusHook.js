const debug = require('debug')('payment-gateway:paymentStatusHook');
const request = require('request');

const PaymentEvents = require('./events/payment.emitter');

const StatusHook = require('../models/statusHook.model').model;

const config = require('./config');

const invokeHook = (event, payment, statusHookModel) => new Promise(resolve => {

	const {
			_id,
			address,
			amount,
			currency,
			confirmations,
			createdAt,
			paidAt,
			expiresAt,
			receivedAt
		} = payment;

	const payload = {
		payment: {
			id: _id,
			address,
			amount,
			currency,
			confirmations,
			createdAt,
			paidAt,
			expiresAt,
			receivedAt
		},
		event,
		attempt: statusHookModel.retries
	};

	// Push a notification to merchant's status hook
	request({
		method: "POST",
		uri: payment.statusHook,
		body: payload,
		json: true,
		followAllRedirects: true,
		maxRedirects: 5,
		gzip: true
	}, (error, response, body) => {

		statusHookModel.statusCode = response ? response.statusCode : -1;
		statusHookModel.responseMessage = error ? JSON.stringify(error) : body;
		statusHookModel.lastRequestAt = Date.now();

		if(!response || response.statusCode !== 200 || !/^OK\r?\n?$/.test(body)) statusHookModel.retries++;

		resolve();
	});
})

const makeListener = event => {
	return async (payment, cb) => {

		if(!payment.statusHook) return cb && cb();

		try
		{
			let statusHook = await StatusHook.findOne({ payment: payment._id, type: event });

			if(!statusHook)
			{
				statusHook = new StatusHook({
					payment: payment._id,
					type: event
				});
			}
			else if(statusHook.statusCode === 200) return cb && cb(); // Hook already successfully sent

			debug(`Calling status hook for payment '${payment._id}' event '${event}'`);

			await invokeHook(event, payment, statusHook);

			debug("OK");

			await statusHook.save();

			cb && cb();
		}
		catch(e)
		{
			if(e) debug(e);
			cb && cb(e);
		}
	}
}

const onCreated = makeListener('created');
const onReceived = makeListener('received');
const onFinalized = makeListener('finalized');
const onExpired = makeListener('expired');

PaymentEvents.on('created', onCreated);
PaymentEvents.on('received', onReceived);
PaymentEvents.on('finalized', onFinalized);
PaymentEvents.on('expired', onExpired);

module.exports = () => {
	PaymentEvents.removeListener('created', onCreated);
	PaymentEvents.removeListener('received', onReceived);
	PaymentEvents.removeListener('finalized', onFinalized);
	PaymentEvents.removeListener('expired', onExpired);
}