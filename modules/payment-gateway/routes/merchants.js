const makeCrudEndpoint = require('./crudEndpoint');

const Merchant = require('../models/merchant.model');

module.exports = makeCrudEndpoint({
	name: 'merchants',
	Model: Merchant,
	permissions: {
		create: [ 'admin' ],
		read: [ 'admin' ],
		update: [ 'admin', 'merchant' ],
		delete: [ 'admin', 'merchant' ]
	},
	uidField: 'username',
	middleware: {
		create: (req, data) => ({ ...data, createdBy: req.token.id }),
		read: (req, data) => data.map(model => ({ ...model, createdBy: (model.createdBy || { username: "N/A" }).username }))
	},
	populateRefs: [ 'createdBy' ],
});