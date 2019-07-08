const request = require('supertest');
const Joi = require('@hapi/joi');
const _ = require('lodash');

const app = require('../../app');

const Payment = require('../../models/payment.model');

let db;

let merchantId = null;

const paymentValidator = Joi.object().keys({

	_id: Joi.string().hex().length(24).required(),
	address: Joi.string().required(), // No strict rules for validating the address since addresses can vary from coin to coin
	amount: Joi.number().positive().required(),
	currency: Joi.string().alphanum().min(1).max(5),
	customerEmail: Joi.string().email({ minDomainSegments: 2 }).required(),
	confirmations: Joi.number().integer().min(0).required(),
	createdAt: Joi.date().required(),
	expiresAt: Joi.date().greater(Joi.ref('createdAt')).required(),
	paidAt: Joi.valid(null).required(),
	receivedAt: Joi.valid(null).required()

});

beforeAll(done => {
	require('../../src/database')('_test_payments')(conn => {
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
				createdBy: testClient.id
			});

			testCoin.save().then(coin => {
				const Merchant = require('../../models/merchant.model');

				const testMerchant = new Merchant.model({
					username: "test",
					password: "test123",
					createdBy: "f".repeat(24) // Dummy id
				});

				testMerchant.save()
								.then(() => { merchantId = testMerchant._id; })
								.finally(() => done())
								.catch(console.error);
			}).catch(console.error);
		}).catch(console.error);
	});
});

let testPayment = {};

beforeAll(() => {
	testPayment = new Payment.model({
		merchant: merchantId,
		address: "ADDRESS",
		amount: 10,
		currency: "OCUL",
		customerEmail: "test@example.com"
	});

	return testPayment.save();
});


const validatePaymentBody = ({ body }) => {
	const { error } = Joi.validate(body, paymentValidator);

	if(error) throw Error(`Payment body invalid. Error: ${error}`);
}

describe('Tests the "create payment" API endpoint', () => {
	const payment = () => ({ // Lazily create the payment object because `merchantId` is empty before the tests are run
		merchantId,
		amount: 10,
		currency: "OCUL",
		customerEmail: "test@example.com"
	});

	it('Should create a new payment', () => {
		return request(app)
				.post('/payments')
				.send(payment())
				.set('Content-Type', 'application/json')
				.expect(200)
				.expect(validatePaymentBody);
	});

	it('Should create a new payment with the optional payment status web hook', () => {
		return request(app)
				.post('/payments')
				.send(_.assign({}, payment(), { statusHook: "https://test.hook.com/hook" }))
				.set('Content-Type', 'application/json')
				.expect(200)
				.expect(validatePaymentBody);
	});

	it('Should fail with 400 when request body is empty', () => {
		return request(app)
				.post('/payments')
				.send({})
				.set('Content-Type', 'application/json')
				.expect(400);
	});

	it('Should fail with 400 when a payment with a negative amount is created', () => {
		return request(app)
				.post('/payments')
				.send(_.assign({}, payment(), { amount: -50 }))
				.set('Content-Type', 'application/json')
				.expect(400);
	});

	it('Should fail with 404 coin not found', () => {
		return request(app)
				.post('/payments')
				.send(_.assign({}, payment(), { currency: "BTC" }))
				.set('Content-Type', 'application/json')
				.expect(404);
	});

	it('Should fail with 403 invalid merchant id', () => {
		return request(app)
				.post('/payments')
				.send(_.assign({}, payment(), { merchantId: "f".repeat(24) }))
				.set('Content-Type', 'application/json')
				.expect(403);
	});
});

describe('Tests the "get payment" API endpoint', () => {
	
	it('Gets the test payment', () => {
		return request(app)
				.get(`/payments/${testPayment.id}`)
				.expect(200)
				.expect(validatePaymentBody);
	});

	it('Fails to get the test payment with 404', () => {
		return request(app)
					.get(`/payments/${"f".repeat(24)}`)
					.expect(404);
	});

	it('Fails to get the test payment due to malformed payment id', () => {
		return request(app)
					.get('/payments/123')
					.expect(400);
	});

});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});