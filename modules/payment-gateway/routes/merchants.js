const makeCrudEndpoint = require('./crudEndpoint');

const Merchant = require('../models/merchant.model');

module.exports = makeCrudEndpoint({
	name: 'merchants',
	Model: Merchant,
	permissions: {
		create: [ 'admin' ],
		read: [ 'admin' ],
		readSingle: [ 'admin' ],
		update: [ 'admin', 'merchant' ],
		delete: [ 'admin' ]
	},
	uidField: 'username',
	middleware: {
		create: (req, data) => ({ ...data, createdBy: req.token.id }),
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
		}
	},
	populateRefs: [ 'createdBy' ],
});