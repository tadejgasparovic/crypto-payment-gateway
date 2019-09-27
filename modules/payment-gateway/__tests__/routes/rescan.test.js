const request = require('supertest');
const Joi = require('@hapi/joi');

const config = require('../../src/config');
const rescanAsyncWorker = require('../../src/rescanAsyncWorker');

const app = require('../../app');

const Rescan = require('../../models/rescan.model');

const token = require('../../src/token');

let db = null;

let adminToken = null;

const rescanValidator = Joi.object().keys({
	_id: Joi.string().hex().length(24).required(),
	currency: Joi.string().regex(/[a-zA-Z0-9]{1,5}/).required(),
	currentBlock: Joi.number().integer().min(0).required(),
	firstBlock: Joi.number().integer().min(0).required(),
	blocksLeft: Joi.number().integer().required(),
	status: Joi.string().valid('created', 'running', 'stopped', 'finished', 'failed').required(),
	error: Joi.array().items(Joi.string()).required(),
	createdAt: Joi.date().required(),
	doneAt: Joi.date()
});

beforeAll(done => {
	require('../../src/database')('_test_rescans')(conn => {
		db = conn;

		// Prepare DB
		const Client = require('../../models/client.model');

		const testClient = new Client.model({
			username: 'test',
			password: 'test123',
			createdBy: "f".repeat(24) // Dummy id
		});

		testClient.save().then(() => {
			const Coin = require('../../models/coin.model');

			const testCoin = new Coin.model({
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
				},
				createdBy: testClient._id
			});

			testCoin.save().then(coin => {
				const Admin = require('../../models/admin.model');

				const testAdmin = new Admin.model({
					username: "admin",
					password: "admin123",
					createdBy: "f".repeat(24) // Dummy id
				});

				testAdmin.save()
								.then(() => token(testAdmin.id, 'admin', '127.0.0.1'))
								.then(token => adminToken = token)
								.finally(() => done())
								.catch(console.error);
			}).catch(console.error);
		}).catch(console.error);
	});
});

describe('Tests the "start rescan" endpoint', () => {

	it('Starts a rescan by block hash', () => {
		return request(app)
				.post('/transactions/rescan')
				.set('Authorization', `Bearer ${adminToken}`)
				.set('Content-Type', 'application/json')
				.send({ block: "3a88f95980bf53945b90aa6503e27b7be4ce1cd92e5c587ddff08732200e0fbe", currency: "OCUL" })
				.expect(200)
				.expect(({ body }) => {
					const { error } = Joi.validate(body, rescanValidator);

					if(error) throw error;

					expect(body.status).toBe('running');
				});
	});

	it('Starts a rescan by block height', () => {
		return request(app)
				.post('/transactions/rescan')
				.set('Authorization', `Bearer ${adminToken}`)
				.set('Content-Type', 'application/json')
				.send({ block: 118675, currency: "OCUL" })
				.expect(200)
				.expect(({ body }) => {
					const { error } = Joi.validate(body, rescanValidator);

					if(error) throw error;

					expect(body.status).toBe('running');
				});
	});

	it('Triggers a rescan conflict', async () => {
		const rescan = new Rescan.model({
			currency: "OCUL",
			firstBlock: 118675,
			status: 'running'
		});
		
		await rescan.save();

		await request(app)
				.post('/transactions/rescan')
				.set('Authorization', `Bearer ${adminToken}`)
				.set('Content-Type', 'application/json')
				.send({ block: 118675, currency: "OCUL" })
				.expect(409);
	});

	it('Fails to start a rescan for an unknown coin', () => {
		return request(app)
				.post('/transactions/rescan')
				.set('Authorization', `Bearer ${adminToken}`)
				.set('Content-Type', 'application/json')
				.send({ block: 118675, currency: "BTC" })
				.expect(404);
	});

});

describe('Tests the "stop rescan" endpoint', () => {

	it('Stops a rescan', async () => {
		const rescan = new Rescan.model({
			currency: "OCUL",
			firstBlock: 118675
		});
		
		await rescan.save();

		rescanAsyncWorker(rescan);

		return request(app)
				.post(`/transactions/rescan/${rescan._id}/stop`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200)
				.expect(({ body }) => {
					const { error } = Joi.validate(body, rescanValidator);

					if(error) throw error;

					expect(body.status).toBe('stopped');
				});
	});

	it('Fails to stop a rescan with an invalid ID', () => {
		return request(app)
				.post('/transactions/rescan/invalidId/stop')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(400)
				.expect(({ body }) => {
					expect(body).toHaveProperty('error');
				})
	});

	it('Fails to stop a non-existent rescan', () => {
		return request(app)
				.post('/transactions/rescan/ffffffffffffffffffffffff/stop')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(404)
				.expect(({ text }) => {
					expect(text).toBe('Not Found');
				})
	});

	it('Fails to stop a non-running rescan', async () => {
		const rescan = new Rescan.model({
			currency: "OCUL",
			firstBlock: 118675
		});
		
		await rescan.save();

		return request(app)
				.post(`/transactions/rescan/${rescan._id}/stop`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(400)
				.expect(({ body }) => {
					expect(body).toHaveProperty('error');
				})
	});

	it('Fails to stop a rescan without a running worker', async () => {
		const rescan = new Rescan.model({
			currency: "OCUL",
			firstBlock: 118675,
			status: "running"
		});
		
		await rescan.save();

		return request(app)
				.post(`/transactions/rescan/${rescan._id}/stop`)
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(400)
				.expect(({ body }) => {
					expect(body).toHaveProperty('error');
				});
	});

});

describe('Tests the "list rescans" endpoint', () => {

	it('Lists all rescans', () => {
		return request(app)
				.get('/transactions/rescan')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200)
				.expect(({ body }) => {
					if(!Array.isArray(body)) throw Error("Didn't receive an array of rescans");
				});
	});

});

afterEach(done => {
	Rescan.model.deleteMany().then().finally(() => {
		try
		{
			if(rescanAsyncWorker.isRunning()) rescanAsyncWorker.stop(() => done());
			else done();
		}
		catch(e)
		{
			console.error(e);
			done();
		}
	});
});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});