const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const debug = require('debug')('payment-gateway:paymentsAPI');
const _ = require('lodash');

const config = require('../src/config');

const coinAdapter = require('../src/coin-adapters');

const Payment = require('../models/payment.model');
const Merchant = require('../models/merchant.model');

const PaymentEvents = require('../src/events/payment.emitter');

const auth = require('../src/middleware/auth');
const validation = require('../src/middleware/validation');

// Create a new payment
router.post('/', validation(Payment.schema), (req, res, next) => {
	const { body } = req;

	const countMerchants = Merchant.model.countDocuments({ _id: body.merchantId }).exec();

	countMerchants.then(count => {
		if(count === 1) return coinAdapter(body.currency);
		else
		{
			debug(`Merchant with id ${body.merchantId} not found!`);
			res.status(403).send("Unauthorized");
			throw Error('Merchant not found');
		}
	})
	.then(coin => {

			if(!coin)
			{
				res.status(404);
				res.json({ error: "Coin not found" });
				res.end();
				throw Error("Coin not found");
			}

			return coin.newAddress();
		})
	.then(address => {
		if(!address) throw new Error("No address!");

		const payment = new Payment.model({
			merchant: body.merchantId,
			address,
			amount: body.amount,
			currency: body.currency,
			customerEmail: body.customerEmail,
			statusHook: body.statusHook
		});

		return payment.save();
	})
	.then(payment => {
		PaymentEvents.created(payment);
		res.send({ ...payment.toJSON(), requiredConfirmations: config.requiredConfirmations });
	})
	.catch(e => {
		debug(`Payment creation failed for coin "${body.currency}"!`);
		debug(e);
		if(!res.finished) res.status(500).send("Internal Error");
	});
});

// Get a payment by id
router.get('/:id', (req, res, next) => {
	const { params } = req;

	if(!params.id || !/^[a-f0-9]{24}$/.test(params.id))
	{
		res.status(400);
		res.json({ error: `Payment ID "${params.id}" doesn't satisfy the regex /^[a-f0-9]{24}$/` });
		res.end();
		return;
	}

	Payment.model.findById(params.id)
					.then(payment => payment ? res.send({ ...payment.toJSON(), requiredConfirmations: config.requiredConfirmations }) : res.status(404).send("Not Found"))
					.catch(e => {
						debug(`Cannot find payment with ID ${params.id}!`);
						debug(e);

						res.status(500).send("Internal Error");
					});
});

// Get all payments
router.get('/', auth('admin'), (req, res, next) => {
	Payment.model.find({})
					.sort('-createdAt')
					.then(payments => {
						if(payments)
						{
							res.send(payments.map(payment => ({ ...payment.toObject(), requiredConfirmations: config.requiredConfirmations })));
						}
						else res.status(404).send("Not Found");
					})
					.catch(e => {
						debug("Cannot return a list of payments");
						debug(e);

						res.status(500).send("Internal Error");
					});
});

module.exports = router;
