const request = require('supertest');
const Joi = require('@hapi/joi');

let app = require('../../app');

const Admin = require('../../models/admin.model');
const Client = require('../../models/client.model');
const Merchant = require('../../models/merchant.model');
const Coin = require('../../models/coin.model');

const token = require('../../src/token');

let db;

let admin;
let client;
let merchant;

let clientToken;
let merchantToken;
let adminToken;

const coinValidator = Joi.object().keys({
	_id: Joi.string().hex().length(24).required(),
	name: Joi.string().min(2).required(),
	symbol: Joi.string().alphanum().min(1).max(5).required(),
	adapter: Joi.string().valid('rpc').required(),
	adapterProps: Joi.object().required(),
	createdAt: Joi.date().less(Date.now() + 60000).required()
});

const validateCoinBody = ({ body }) => {
	const { error } = Joi.validate(body, coinValidator);

	if(error) throw Error(`Coin body invalid. Error: ${error}`);
}

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

			adminToken = token(admin.id, 'admin', '127.0.0.1');

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

	it('Creates a new coin', () => {
		return request(app)
				.post('/coins')
				.set('Authorization', `Bearer ${clientToken}`)
				.send(coinBody)
				.expect(200)
				.expect(validateCoinBody);
	});

	it('Creates a new coin as an admin', () => {
		return request(app)
				.post('/coins')
				.set('Authorization', `Bearer ${adminToken}`)
				.send({ ...coinBody, createdBy: client._id })
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
		const testCoin = new Coin.model({
			...coinBody,
			createdBy: client._id
		});

		return testCoin.save()
				.then(() => {
					return request(app)
							.post('/coins')
							.set('Authorization', `Bearer ${clientToken}`)
							.send(coinBody)
							.expect(400)
							.expect(({ body }) => {
								expect(body).toHaveProperty('error');
								expect(body.error).toEqual(expect.stringContaining("Duplicate entry"));
							});
				})
				.catch(console.error)
				.finally(() => Coin.model.deleteOne({ _id: testCoin._id }));
	});

	it('Fails to create a coin with an invalid name', () => {
		return request(app)
				.post('/coins')
				.set('Authorization', `Bearer ${clientToken}`)
				.send({ ...coinBody, name: "" })
				.expect(400);
	});

});

describe('Tests the "update coin" API endpoint', () => {

	it('Updates the coin name as a client', () => {
		const testCoin = new Coin.model({
			...coinBody,
			createdBy: client._id
		});

		return testCoin.save()
						.then(() => {
							return request(app)
									.post(`/coins/${coinBody.symbol}`)
									.set('Authorization', `Bearer ${clientToken}`)
									.set('Content-Type', 'application/json')
									.send({ ...coinBody, name: "Test coin" })
									.expect(200)
									.expect(validateCoinBody);
						});
	});

	it('Updates the coin name as an admin', () => {
		const testCoin = new Coin.model({
			...coinBody,
			createdBy: client._id
		});

		return testCoin.save()
						.then(() => {
							return request(app)
									.post(`/coins/${coinBody.symbol}`)
									.set('Authorization', `Bearer ${adminToken}`)
									.set('Content-Type', 'application/json')
									.send({ ...coinBody, name: "Test coin", createdBy: client.id })
									.expect(200)
									.expect(validateCoinBody);
						});
	});

	it('Reads a list of coins', () => {
		const testCoin = new Coin.model({
			...coinBody,
			createdBy: client._id
		});

		return testCoin.save()
						.then(() => {
							return request(app)
									.get('/coins')
									.set('Authorization', `Bearer ${adminToken}`)
									.expect(200)
									.expect(({ body }) => {
										expect(Array.isArray(body)).toBe(true);
									});
						});
	});

});

afterEach(() => {
	return Coin.model.deleteOne({ symbol: coinBody.symbol });
});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});