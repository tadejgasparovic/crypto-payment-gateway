const debug = require('debug')('payment-gateway:expiryCron');

const Payment = require('../../models/payment.model').model;

const PaymentEvents = require('../events/payment.emitter');

async function work()
{
	const expiredPayments = (await Payment.aggregate([
			{
				$match: { paidAt: null, expiresAt: { $lte: new Date() } }
			},
			{
				$lookup: {
					from: "notifications",
					localField: "_id",
					foreignField: "payment",
					as: "notifications"
				}
			}
		]).exec()).filter(payment => payment.notifications.length === 0);

	debug(`Found ${expiredPayments.length} expired payments`);

	const promises = expiredPayments.map(payment => new Promise((resolve, reject) => PaymentEvents.expired(payment, err => err ? reject(err) : resolve())));

	return Promise.all(promises);
}

module.exports = work;