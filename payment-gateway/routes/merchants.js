const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const debug = require('debug')('payment-gateway:merchantsAPI');
const _ = require('lodash');

const auth = require('../src/middleware/auth');

const Merchant = require('../models/merchant.model');

router.post('/', auth('admin'), (req, res) => {
	const { body } = req;

	const { error } = Joi.validate(body, Merchant.schema);

	if(error) return res.status(400).json({ error: (error.details && error.details.length > 0) ? error.details[0].message : "Body validation failed" }).end();

	const merchant = new Merchant.model({
		..._.pick(body, _.keys(Joi.describe(Merchant.schema).children)),
		createdBy: req.token.id
	});

	merchant.save()
			.then(() => {
				res.send(merchant);
			})
			.catch(e => {
				debug(`Payment creation failed for coin "${body.currency}"!`);
				debug(e);
				if(!res.finished) res.status(500).end();
			});
});

module.exports = router;