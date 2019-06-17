const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const debug = require('debug')('payment-gateway:paymentsAPI');
const _ = require('lodash');

const coinAdapter = require('../src/coin-adapters');

const Payment = require('../models/payment.model');
const Merchant = require('../models/merchant.model');

const PaymentEvents = require('../src/events/payment.emitter');

// Create a new payment
router.post('/', (req, res, next) => {
	const { body } = req;

	const { error } = Joi.validate(body, Payment.schema);

	if(error) return res.status(400).json({ error: (error.details && error.details.length > 0) ? error.details[0].message : "Body validation failed" }).end();

	const countMerchants = Merchant.model.countDocuments({ _id: body.merchantId }).exec();

	countMerchants.then(count => {
		if(count === 1) return coinAdapter(body.currency);
		else
		{
			debug(`Merchant with id ${body.merchantId} not found!`);
			res.status(403).end();
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
		res.send(payment);
	})
	.catch(e => {
		debug(`Payment creation failed for coin "${body.currency}"!`);
		debug(e);
		if(!res.finished) res.status(500).end();
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

	Payment.model.findById(params.id).exec().then(payment => payment ? res.send(payment) : res.status(404).end()).catch(e => {
		debug(`Cannot find payment with ID ${params.id}!`);
		debug(e);

		res.status(500).end();
	});
});

module.exports = router;
