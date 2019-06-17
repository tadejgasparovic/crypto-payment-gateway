const request = require('supertest');

const config = require('../../src/config');

let app = require('../../app');

const Payment = require('../../models/payment.model');

let db = null;

let merchantId = null;

beforeAll((done) => {
	require('../../src/database')('_test_transactions')(conn => {
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

let testPayment = null;

beforeEach(() => {
	testPayment = new Payment.model({
		merchant: merchantId,
		address: "sc5J9ZSUbqYzWXhCiLXrqZiNeKoVu2HeiF",
		amount: 4763.12,
		currency: "OCUL",
		customerEmail: "test@example.com"
	});

	return testPayment.save();
});

describe('Tests the "transaction notify" API endpoint', () => {

	it('Should respond with 200 OK and mark payment as paid', () => {
		return request(app)
				.post('/transactions')
				.send({ txid: "29a4c8805d78a26efb37b5890832e7e41d61a891a722571577f574c54fdb34b0", currency: "OCUL" })
				.set('Content-Type', 'application/json')
				.expect(200)
				.then(() => {
					return Payment.model.findById(testPayment._id).exec();
				})
				.then(payment => {
					if(!payment) throw Error("Test payment not found");

					expect(payment.receivedAt).not.toBe(null);
					expect(payment.paidAt).not.toBe(null);
					expect(payment.confirmations).toBeGreaterThan(0);
				});
	});

	it('Should ignore payments made for expired payments', () => {
		testPayment.expiresAt = new Date(60 * 60 * 1000);

		return testPayment.save().then(() => {
			return request(app)
					.post('/transactions')
					.send({ txid: "29a4c8805d78a26efb37b5890832e7e41d61a891a722571577f574c54fdb34b0", currency: "OCUL" })
					.set('Content-Type', 'application/json')
					.expect(200);
		}).then(() => {
			return Payment.model.findById(testPayment._id).exec();
		})
		.then(payment => {
			if(!payment) throw Error("Test payment not found");

			expect(payment.receivedAt).toBe(null);
			expect(payment.paidAt).toBe(null);
			expect(payment.confirmations).toBe(0);
		});
	});

	it('Should ignore payments with a value lower than the required value', () => {
		testPayment.amount = 10000;

		return testPayment.save().then(() => {
			return request(app)
					.post('/transactions')
					.send({ txid: "29a4c8805d78a26efb37b5890832e7e41d61a891a722571577f574c54fdb34b0", currency: "OCUL" })
					.set('Content-Type', 'application/json')
					.expect(200);
		}).then(() => {
			return Payment.model.findById(testPayment._id).exec();
		})
		.then(payment => {
			if(!payment) throw Error("Test payment not found");

			expect(payment.receivedAt).toBe(null);
			expect(payment.paidAt).toBe(null);
			expect(payment.confirmations).toBe(0);
		});
	});

	it('Should update receivedAt but not paidAt for transactions with too few confirmations', () => {
		config.setRequiredConfirmations(Number.MAX_SAFE_INTEGER);

		return request(app)
				.post('/transactions')
				.send({ txid: "29a4c8805d78a26efb37b5890832e7e41d61a891a722571577f574c54fdb34b0", currency: "OCUL" })
				.set('Content-Type', 'application/json')
				.expect(200)
				.then(() => {
					return Payment.model.findById(testPayment._id).exec();
				})
				.then(payment => {
					if(!payment) throw Error("Test payment not found");

					expect(payment.receivedAt).not.toBe(null);
					expect(payment.paidAt).toBe(null);
					expect(payment.confirmations).toBeGreaterThan(0);
				})
				.finally(() => config.setRequiredConfirmations(3));
	});

});

afterEach(() => {
	return Payment.model.findByIdAndDelete(testPayment._id).exec();
});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});