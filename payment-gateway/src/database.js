const mongoose = require('mongoose');
const debug = require('debug')('payment-gateway:mongoDB');

const config = require('./config');

module.exports = (suffix = '') => callback => {

	mongoose.connect(`mongodb://${config.dbHost || '127.0.0.1'}:${config.dbPort || 27017}/payment-gateway${suffix}`, { useNewUrlParser: true, useCreateIndex: true }, () => {
		debug("Database connection open...");

		callback({
			drop: () => mongoose.connection.dropDatabase(),
			close: cb => mongoose.connection.close(false, cb)
		});
	});

	mongoose.connection.on('disconnected', () => debug("Database connection closed..."));
	mongoose.connection.on('reconnected', () => debug("Reconnected to MongoDB..."));
	mongoose.connection.on('reconnectFailed', () => {
		debug("MongoDB reconnect failed... Terminating...");
		process.exit(2);
	});
	mongoose.connection.on('error', e => {
		debug(e);
		if(e.name === 'MongoNetworkError') process.exit(1); // Connection failed on initial connect
	});
}