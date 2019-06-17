const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const debug = require('debug')('payment-gateway:coinsAPI');
const _ =  require('lodash');

const Coin = require('../models/coin.model');

const auth = require('../src/middleware/auth');

router.post('/', auth('client', 'admin'), (req, res) => {
	const { error } = Joi.validate(req.body, Coin.schema);

	if(error) return res.status(400).json({ error: (error.details && error.details.length > 0) ? error.details[0].message : "Body validation failed" }).end();

	const coin = new Coin.model({
		...(_.pick(req.body, _.keys(Joi.describe(Coin.schema).children))),
		createdBy: req.token.id,
		createdByType: req.token.type
	});

	coin.save().then(() => res.status(200).send(coin))
				.catch(e => {
					debug("Couldn't save new coin!");
					debug(e);
					res.status(500).end();
				});
});

module.exports = router;