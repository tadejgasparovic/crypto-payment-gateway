const makeCrudEndpoint = require('./crudEndpoint');

const Client = require('../models/client.model');


module.exports = makeCrudEndpoint({
	name: 'clients',
	Model: Client,
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
	uidField: 'username',
	populateRefs: [ 'createdBy' ],
	permissions: {
		create: [ 'admin' ],
		read: [ 'admin' ],
		readSingle: [ 'admin' ],
		update: [ 'admin', 'client' ],
		delete: [ 'admin' ]
	}
});