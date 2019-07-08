const nodemailer = require('nodemailer');
const formatDate = require('date-format');
const _ = require('lodash');

const Payment = require('../../models/payment.model');
const PaymentEvents = require('../../src/events/payment.emitter');

const config = require('../../src/config');

jest.mock('nodemailer');

let db;

let unhookNotifications;

let merchantId;

const transportMock = {
	sendMail: jest.fn().mockResolvedValue(),
	verify: jest.fn().mockResolvedValue()
};

beforeAll(() => {
	nodemailer.createTransport.mockReturnValue(transportMock);

	unhookNotifications = require('../../src/notifications');
});

beforeAll(done => {
	require('../../src/database')('_test_notifications')(conn => {
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

			return testCoin.save();
		})
		.then(coin => {
			const Merchant = require('../../models/merchant.model');

			const testMerchant = new Merchant.model({
				username: "test",
				password: "test123",
				createdBy: "f".repeat(24) // Dummy id
			});

			return Promise.all([ Promise.resolve(testMerchant), testMerchant.save() ]);
		})
		.then(([ testMerchant ]) => merchantId = testMerchant.id)
		.finally(() => done())
		.catch(console.error);
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

describe('Tests the payment event based email notifications', () => {

	it('Fires a "created" event', done => {
		PaymentEvents.created(testPayment, err => {
			expect(err).toBe(undefined);

			expect(transportMock.sendMail.mock.calls.length).toBe(1);

			expect(transportMock.sendMail).toBeCalledWith({
				...config.mailDefaults,
				...(require('../../mail/payment/created.mail') || (() => ({})))(testPayment.customerEmail, {
					..._.pick(testPayment, [ '_id', 'address', 'amount', 'currency' ]),
					expiry: formatDate(config.dateFormat, testPayment.expiresAt)
				})
			});

			done();
		});
	});

	[ 'received', 'finalized', 'expired' ].forEach(event => {

		it(`Fires a "${event}" event`, done => {
			PaymentEvents[event](testPayment, err => {
				expect(err).toBe(undefined);

				expect(transportMock.sendMail.mock.calls.length).toBe(1);

				expect(transportMock.sendMail).toBeCalledWith({
					...config.mailDefaults,
					...(require(`../../mail/payment/${event}.mail`) || (() => ({})))(testPayment.customerEmail, testPayment._id)
				});

				done();
			});
		});

	});

});

describe('Tests email.verify()', () => {

	it('Should call nodemailerTransport.verify()', done => {
		require('../../src/email').verify()
									.then(() => {
										expect(transportMock.verify).toBeCalled();
									})
									.catch(err => {
										console.error(err);
										throw err;
									})
									.finally(() => done());
	});

});

afterEach(() => {
	// Reset mocks
	transportMock.sendMail.mock.calls.length = 0;
});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});

afterAll(() => {
	if(unhookNotifications) unhookNotifications();
});