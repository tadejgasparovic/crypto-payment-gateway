const debug = require('debug')('payment-gateway:expiryCron');

const Payment = require('../../models/payment.model').model;

const PaymentEvents = require('../events/payment.emitter');

async function work()
{
	try
	{
		const expiredPayments = await Payment.aggregate([
				{
					$match: {
						paidAt: null,
						expiresAt: { $lte: new Date() }
					}
				},
				{
					$lookup: {
						from: "notifications",
						as: "notifications",
						let: {
							id: '$_id'
						},
						pipeline: [{
							$match: {
								$expr: {
									$and: [
										{ $eq: [ '$type', 'expired' ] },
										{ $eq: [ '$payment', '$$id' ] }
									]
								}
							}
						}]
					}
				},
				{
					$match: {
						notifications: {
							$eq: []
						}
					}
				}
			]).exec();

		debug(`Found ${expiredPayments.length} expired payments`);

		const promisify = payment => new Promise((resolve, reject) => {
			PaymentEvents.expired(payment, err => err ? reject(err) : resolve());
		});

		const promises = expiredPayments.map(promisify);

		await Promise.all(promises);
	}
	catch(e)
	{
		debug(e);
	}
}

module.exports = work;