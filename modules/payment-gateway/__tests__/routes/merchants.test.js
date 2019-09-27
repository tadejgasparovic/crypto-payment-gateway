const request = require('supertest');
const Joi = require('@hapi/joi');

const app = require('../../app');

const token = require('../../src/token');

const Merchant = require('../../models/merchant.model');
const Admin = require('../../models/admin.model');

let db = null;

let adminToken = null;

beforeAll(done => {
	require('../../src/database')('_test_merchants')(conn => {
		db = conn;

		const defaultAccount = new Admin.model({
	      username: "admin",
	      password: "admin123"
	    });

	    defaultAccount.save()
	    				.then(() => token(defaultAccount._id, 'admin', '127.0.0.1'))
	    				.then(token => adminToken = token)
	    				.catch(console.error)
	    				.finally(() => done());
	});
});

describe('Tests the "create merchant" API endpoint', () => {

	it('Creates a new merchant', () => {
		return request(app)
				.post('/merchants')
				.send({ username: "test", password: "test1234" })
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200);
	});

	it('Fails to create a new merchant with 400', () => {
		return request(app)
				.post('/merchants')
				.send({ username: "test", password: "abc" })
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(400);
	});

});

describe('Tests the "get merchants" API endpoint', () => {

	it('Gets all merchants', () => {
		return request(app)
				.get('/merchants')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(200)
				.expect(({ body }) => {
					const { error } = Joi.validate(body, Joi.array().items(
											Joi.object().keys({
												_id: Joi.string().hex().length(24).required(),
												username: Joi.string().required(),
												createdBy: Joi.string().required(),
												createdAt: Joi.string().required()
											})
										));

					if(error) throw Error(error);
				});
	});

	it('Gets the test merchant', done => {
		const testMerchant = new Merchant.model({
			username: "testMerchant",
			password: "test1234",
			createdBy: "f".repeat(24)
		});

		testMerchant.save()
						.then(() => {
							return request(app)
									.get(`/merchants/${testMerchant.username}`)
									.set('Authorization', `Bearer ${adminToken}`)
									.expect(200)
									.expect(({ body }) => {
										const { error } = Joi.validate(body, Joi.object().keys({
																			_id: Joi.string().hex().length(24).required(),
																			username: Joi.string().required(),
																			createdBy: Joi.string().required(),
																			createdAt: Joi.string().required()
																		}));

										if(error) throw Error(error);
									});
						})
						.catch(console.error)
						.finally(() => {
							Merchant.model.deleteOne({ _id: testMerchant._id })
											.catch(console.error)
											.finally(() => done());
						});
	});

});

describe('Tests the "update merchant" API endpoint', () => {

	it('Updates the test merchant\'s password', done => {
		const testMerchant = new Merchant.model({
			username: "testMerchant",
			password: "test1234",
			createdBy: "f".repeat(24)
		});

		testMerchant.save()
						.then(() => {
							return request(app)
									.post(`/merchants/${testMerchant.username}`)
									.send({ password: "test12345" })
									.set('Authorization', `Bearer ${adminToken}`)
									.expect(200);
						})
						.catch(console.error)
						.finally(() => {
							Merchant.model.deleteOne({ _id: testMerchant._id })
											.catch(console.error)
											.finally(() => done());
						});
	});

	it('Fails to update the test merchant\'s password with 400', done => {
		const testMerchant = new Merchant.model({
			username: "testMerchant",
			password: "test1234",
			createdBy: "f".repeat(24)
		});

		testMerchant.save()
						.then(() => {
							return request(app)
									.post(`/merchants/${testMerchant.username}`)
									.send({ password: "abc" })
									.set('Authorization', `Bearer ${adminToken}`)
									.expect(400);
						})
						.catch(console.error)
						.finally(() => {
							Merchant.model.deleteOne({ _id: testMerchant._id })
											.catch(console.error)
											.finally(() => done());
						});
	});

});

describe('Tests the "delete merchant" API endpoint', () => {

	it('Deletes a test merchant', done => {
		const testMerchant = new Merchant.model({
			username: "testMerchant",
			password: "test1234",
			createdBy: "f".repeat(24)
		});

		testMerchant.save()
						.then(() => {
							return request(app)
									.delete(`/merchants/${testMerchant.username}`)
									.set('Authorization', `Bearer ${adminToken}`)
									.expect(200);
						})
						.catch(console.error)
						.finally(() => {

							Merchant.model.deleteOne({ _id: testMerchant._id })
											.catch(console.error)
											.finally(() => done());
						});
	});

});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});