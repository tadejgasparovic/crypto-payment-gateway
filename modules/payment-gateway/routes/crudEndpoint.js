const express = require('express');
const Joi = require('@hapi/joi');
const makeDebug = require('debug');
const _ =  require('lodash');

const auth = require('../src/middleware/auth');
const validation = require('../src/middleware/validation');

module.exports = options => {

	const {
			name, // Endpoint name
			Model, // Model controlled by the endpoint
			permissions = { // Endpoint auth permissions (empty array === no auth / public)
							create: [],
							read: [],
							update: [],
							delete: []
						},
			middleware = {}, /* {
								create: (req, data, Model) => updatedData, // Called before a new model is created with validated fields in `data`
								read: (req, data, Model) => updatedData, // Called after the model `data` is read from the DB, right before it's sent off to the client
								before: action => (req, res, next) => next(), // Function which returns an express middleware for the specific route; middleware is run before the route
							} */
			validationSchemas = { // Custom Joi validation schemas; if falsy it defaults to the model schema
				create: null,
				update: null
			},
			populateRefs, // E.g.: [ 'createdBy' ]
			uidField = "_id", // DB field to be used as the unique identifier for the model update route `/:uidField`
		} = options;

	// Create a debug logger
	const debug = makeDebug(`payment-gateway:${name}API`);

	const permissionSchema = Joi.object().keys({
		create: Joi.array().items(Joi.string()).required(),
		read: Joi.array().items(Joi.string()).required(),
		update: Joi.array().items(Joi.string()).required(),
		delete: Joi.array().items(Joi.string()).required()
	});

	const { error } = Joi.validate(permissions, permissionSchema);

	if(error)
	{
		debug(`ERROR: Invalid CRUD permission schema at CRUD endpoint ${name}`);
		debug(error);
		throw Error(error);
	}

	const router = express.Router();

	// Create
	let beforeCreate = middleware.before && middleware.before('create');
	if(!beforeCreate) beforeCreate = (req, res, next) => next();

	let createAuth = permissions.create.length < 1 ? ((req, res, next) => next()) : auth(...permissions.create);

	let createValidator = validation(Model.schema, false, false, validationSchemas.create);

	router.post('/', createAuth, beforeCreate, createValidator, (req, res) => {

		const updatedData = middleware.create(req, req.valid, Model);

		const model = new Model.model(updatedData);

		model.save()
				.then(() => res.send(model))
				.catch(e => {
					debug(`ERROR: Endpoint ${name} failed to create model ${uidField}:${req.body[uidField]}!`);
					debug(e);

					if(e.message.includes('E11000'))
					{
						const match = e.message.match(/dup key: {.*"(.*)".*}/);

						if(match[1])
						{
							res.status(400).json({ error: `Duplicate entry "${match[1]}"!` });
							return;
						}

						res.status(400).json({ error: "Duplicate entry!" });
						return;
					}

					res.status(500).send("Internal Error");
				});
	});

	// Read
	let beforeRead = middleware.before && middleware.before('read');
	if(!beforeRead) beforeRead = (req, res, next) => next();

	let readAuth = permissions.read.length < 1 ? ((req, res, next) => next()) : auth(...permissions.read);

	router.get('/', readAuth, beforeRead, (req, res) => {
		const query = Model.model.find({});

		if(populateRefs &&
			typeof populateRefs === 'object' &&
			populateRefs.constructor === Array) populateRefs.forEach(ref => query.populate(ref));

		query.then(models => {
			const modelObjects = models.map(model => model.toObject());
			const mutatedModels = typeof middleware.read === 'function' ? middleware.read(req, modelObjects, Model) : modelObjects;

			if(!mutatedModels)
			{
				debug(`ERROR: Endpoint ${name} readMiddleware failed to return a truthy value!`);
				res.status(500).send("Internal Error");
				return;
			}

			res.status(200).send(mutatedModels);
		})
		.catch(e => {
			debug(`ERROR: Couldn't load ${Model.model.collection.collectionName}`);
			debug(e);
			res.status(500).send("Internal Error");
		});
	});

	// Update
	let beforeUpdate = middleware.before && middleware.before('update');
	if(!beforeUpdate) beforeUpdate = (req, res, next) => next();

	let updateAuth = permissions.update.length < 1 ? ((req, res, next) => next()) : auth(...permissions.update);

	let updateValidator = validation(Model.schema, { uid: uidField }, false, validationSchemas.update);

	router.post('/:uid', updateAuth, beforeUpdate, updateValidator, (req, res) => {
		const { uid } = req.params;

		Model.model.findOneAndUpdate({ [uidField]: uid }, req.valid)
						.then(model => {
							if(!model)
							{
								res.status(404).send("Not Found");
								return;
							}

							res.status(200).send(model);
						})
						.catch(e => {
							debug(`Endpoint ${name} failed to update model!`);
							debug(e);
							res.status(500).send("Internal Error");
						});
	});

	// Delete
	let beforeDelete = middleware.before && middleware.before('delete');
	if(!beforeDelete) beforeDelete = (req, res, next) => next();

	const deleteAuth = permissions.delete.length < 1 ? ((req, res, next) => next()) : auth(...permissions.delete);

	router.delete('/:uid', deleteAuth, beforeDelete, (req, res) => {
		const { uid } = req.params;

		Model.model.deleteOne({ [uidField]: uid })
						.then(({ n }) => res.status(n > 0 ? 200 : 404).send(n > 0 ? "OK" : "Not Found"))
						.catch(e => {
							debug(`Endpoint ${name} failed to delete ${uidField}:${uid}!`);
							debug(e);
							res.status(500).send("Internal Error");
						});
	});

	return router;
}