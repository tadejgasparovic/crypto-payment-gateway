const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const debug = require('debug')('payment-gateway:authAPI');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const token = require('../src/token');

const auth = require('../src/middleware/auth');

// Supported account types
const accountTypes = {
	client: require('../models/client.model').model,
	merchant: require('../models/merchant.model').model,
	admin: require('../models/admin.model').model
};

router.post('/', (req, res) => {
	const { error } = Joi.validate(req.body, Joi.object().keys({
		username: Joi.string().min(3).max(255).required(),
		password: Joi.string().min(8).max(255).required(),
		type: Joi.string().valid(Object.keys(accountTypes)).required(),
		extended: Joi.boolean()
	}));

	if(error) return res.status(400).json({ error: (error.details && error.details.length > 0) ? error.details[0].message : "Body validation failed" }).end();

	const { username, password, type, extended = false } = req.body;

	const Account = accountTypes[type];

	Account.findOne({ username })
			.then(account => {
				const { id = "", password: hash = "" } = account || {};
				return Promise.all([ bcrypt.compare(password, hash), Promise.resolve(id) ]);
			})
			.then(([ valid, id ]) => {
				if(!valid)
				{
					res.status(403).send("Unauthorized");
					return;
				}

				return token(id, type, req.connection.remoteAddress, extended);
			})
			.then(token => {
				if(token) res.status(200).send({ token });
				else throw Error("No token");
			})
			.catch(e => {
				debug(e);
				if(!res.finished) res.status(500).send("Internal Error");
			});
});

router.delete('/', auth(...(_.keys(accountTypes))), async (req, res) => {
	try
	{
		await token.invalidate(req.rawToken);
	}
	catch(e)
	{
		debug("Failed to invalidate token");
		debug(req.rawToken);
		debug(req.token);
		debug(e);
	}
	finally
	{
		res.status(200).send("OK");
	}
});

router.get('/check', auth(...(_.keys(accountTypes))), (req, res) => {

	const { id, type } = req.token;

	const Account = accountTypes[type];

	Account.findById(id)
			.then(account => res.status(200).send(account))
			.catch(e => {
				debug(e);
				res.status(500).send("Internal Error");
			});
});

module.exports = router;