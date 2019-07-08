const makeCrudEndpoint = require('./crudEndpoint');

const Client = require('../models/client.model');


module.exports = makeCrudEndpoint({
	name: 'clients',
	Model: Client,
	middleware: {
		create: (req, data) => ({ ...data, createdBy: req.token.id }),
		read: (req, data) => data.map(model => ({ ...model, createdBy: (model.createdBy || { username: "N/A" }).username }))
	},
	uidField: 'username',
	populateRefs: [ 'createdBy' ],
	permissions: {
		create: [ 'admin' ],
		read: [ 'admin' ],
		update: [ 'admin', 'client' ],
		delete: [ 'admin' ]
	}
});