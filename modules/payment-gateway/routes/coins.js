const Joi = require('@hapi/joi');

const makeCrudEndpoint = require('./crudEndpoint');

const Coin = require('../models/coin.model');

module.exports = makeCrudEndpoint({
	name: 'coins',
	Model: Coin,
	uidField: 'symbol',
	populateRefs: [ 'createdBy' ],
	permissions: {
		create: [ 'admin', 'client' ],
		read: [ 'admin', 'client' ],
		readSingle: [ 'admin', 'client' ],
		update: [ 'admin', 'client' ],
		delete: [ 'admin', 'client' ]
	},
	validationSchemas: {
		create: req => {
			const { schema } = Coin;

			if(req.token.type === 'admin')
			{
				return schema.keys({
					createdBy: Joi.string().hex().length(24).required()
				});
			}

			return schema;
		},
		update: req => {
			const { schema } = Coin;

			if(req.token.type === 'admin')
			{
				return schema.keys({
					createdBy: Joi.string().hex().length(24).required()
				});
			}

			return schema;
		}
	},
	middleware: {
		create: (req, data) => {
			return {
				...data,
				createdBy: req.token.type === 'admin' ? data.createdBy : req.token.id
			};
		},
		read: (req, data) => data.map(model => {
			const createdBy = req.query.raw ?
								model.createdBy :
								(model.createdBy || { username: "N/A" }).username;

			return { ...model, createdBy };
		}),
		readSingle: (req, data) => {
			const createdBy = req.query.raw ?
								data.createdBy :
								(data.createdBy || { username: "N/A" }).username;

			return { ...data, createdBy };
		},
		before: action => (req, res, next) => {
			const { name = null, symbol = null, adapter = 'rpc', createdBy, adapterProps } = req.body;

			if(action === 'create' || action === 'update')
			{
				req.body = {
					name,
					symbol,
					adapter,
					adapterProps
				};

				if(createdBy) req.body.createdBy = createdBy;

				next();
			}
			else next();
		}
	}
});