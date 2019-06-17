const request = require('supertest');
const Joi = require('@hapi/joi');

let app = require('../../app');

const Admin = require('../../models/admin.model');
const Client = require('../../models/client.model');
const Merchant = require('../../models/merchant.model');

const token = require('../../src/token');

let db;

let clientToken;
let merchantToken;

const coinValidator = Joi.object().keys({
	_id: Joi.string().hex().length(24).required(),
	name: Joi.string().alphanum().min(2).required(),
	symbol: Joi.string().alphanum().min(1).max(5).required(),
	adapter: Joi.string().valid('rpc').required(),
	adapterProps: Joi.object().required(),
	createdAt: Joi.date().less(Date.now() + 60000).required()
});

const coinBody = {
	name: 'Oculor',
	symbol: 'ocul',
	adapter: 'rpc',
	adapterProps: {
		rpc: {
			host: '127.0.0.1',
			port: 48844,
			user: 'oculor',
			password: 'oculor-dev'
		}
	}
};

beforeAll(done => {
	require('../../src/database')('_test_coins')(conn => {
		db = conn;

		(async () => {
			admin = new Admin.model({ username: "admin", password: "admin" });
			await admin.save();

			client = new Client.model({ username: "client", password: "client", createdBy: admin._id });
			await client.save();

			clientToken = token(client.id, 'client', '127.0.0.1');

			merchant = new Merchant.model({ username: "merchant", password: "merchant", createdBy: admin._id });
			await merchant.save();

			merchantToken = token(merchant.id, 'merchant', '127.0.0.1');
		})().catch(console.error)
			.finally(() => done());
	});
});

describe('Tests the "create coin" API endpoint', () => {

	const validateCoinBody = ({ body }) => {
		const { error } = Joi.validate(body, coinValidator);

		if(error) throw Error(`Coin body invalid. Error: ${error}`);
	}

	it('Creates a new coin', () => {
		return request(app)
				.post('/coins')
				.set('Authorization', `Bearer ${clientToken}`)
				.send(coinBody)
				.expect(200)
				.expect(validateCoinBody);
	});

	it('Fails to create a new coin using an invalid authorization type', () => {
		return request(app)
				.post('/coins')
				.set('Authorization', `IdontExist ${clientToken}`)
				.send(coinBody)
				.expect(403);
	});

	it('Fails to create a new coin without the Authorization header', () => {
		return request(app)
				.post('/coins')
				.send(coinBody)
				.expect(403);
	});

	it('Fails to create a new coin using a "merchant" account', () => {
		return request(app)
				.post('/coins')
				.set('Authorization', `Bearer ${merchantToken}`)
				.send(coinBody)
				.expect(403);
	});

	it('Fails to create a duplicate coin', () => {
		return request(app)
				.post('/coins')
				.set('Authorization', `Bearer ${clientToken}`)
				.send(coinBody)
				.expect(500);
	});

	it('Fails to create a coin with an invalid name', () => {
		return request(app)
				.post('/coins')
				.set('Authorization', `Bearer ${clientToken}`)
				.send({ ...coinBody, name: "" })
				.expect(400);
	});

});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});