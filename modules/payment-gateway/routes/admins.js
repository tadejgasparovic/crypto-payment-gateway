const makeCrudEndpoint = require('./crudEndpoint');

const Admin = require('../models/admin.model');

module.exports = makeCrudEndpoint({
	name: 'admins',
	Model: Admin,
	permissions: {
		create: [ 'admin' ],
		read: [ 'admin' ],
		readSingle: [ 'admin' ],
		update: [ 'admin' ],
		delete: [ 'admin' ]
	},
	uidField: 'username'
});