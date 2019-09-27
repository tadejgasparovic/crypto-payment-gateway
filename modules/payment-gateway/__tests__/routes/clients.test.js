const request = require('supertest');
const Joi = require('@hapi/joi');

let app = require('../../app');

const Admin = require('../../models/admin.model');
const Client = require('../../models/client.model');

const token = require('../../src/token');

let db;

let admin;

let adminToken;

const clientBody = {
	username: "testClient",
	password: "test12345"
};

const clientValidator = Joi.object().keys({
	_id: Joi.string().hex().length(24).required(),
	username: Joi.string().min(3).max(255).required(),
	createdAt: Joi.string().required()
});

beforeAll(done => {
	require('../../src/database')('_test_clients')(conn => {
		db = conn;

		(async () => {
			admin = new Admin.model({ username: "admin", password: "admin" });
			await admin.save();

			adminToken = await token(admin.id, 'admin', '127.0.0.1');
		})().catch(console.error)
			.finally(() => done());
	});
});

describe('Tests the "create client" API endpoint', () => {

	it('Creates a new client', () => {
		return request(app)
				.post('/clients')
				.set('Authorization', `Bearer ${adminToken}`)
				.set('Content-Type', 'application/json')
				.send(clientBody)
				.expect(200)
				.expect(({ body }) => {
					expect(Joi.validate(body, clientValidator).error).toBeFalsy();
				})
	});

	it('Fails to create a client with a short password', () => {
		return request(app)
				.post('/clients')
				.set('Authorization', `Bearer ${adminToken}`)
				.set('Content-Type', 'application/json')
				.send({ ...clientBody, password: "123" })
				.expect(400)
				.expect(({ body }) => {
					expect(body).toHaveProperty('error');
					expect(body.error).toEqual(expect.stringMatching(/password/i));
				});
	});

});

describe('Tests the "read clients" API endpoint', () => {

	it('Retreives a list of clients', () => {
		return request(app)
				.get('/clients')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200)
				.expect(({ body }) => {
					expect(Array.isArray(body)).toBe(true);
				});
	});

	it('Retreives a single client', done => {
		const testClient = new Client.model({
			...clientBody,
			username: "testClient1",
			createdBy: admin._id
		});

		testClient.save()
					.then(() => {
						return request(app)
								.get(`/clients/${testClient.username}`)
								.set('Authorization', `Bearer ${adminToken}`)
								.expect(200)
								.expect(({ body }) => {
									expect(body).toHaveProperty('_id');
									expect(body).toHaveProperty('username');
									expect(body).toHaveProperty('createdAt');
									expect(body.username).toBe(testClient.username);
								});
					})
					.catch(console.error)
					.finally(() => {
						Client.model.deleteOne({ _id: testClient._id })
										.catch(console.error)
										.finally(() => done());
					});
	})

});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});