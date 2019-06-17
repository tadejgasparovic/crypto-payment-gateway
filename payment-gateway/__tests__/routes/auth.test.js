const request = require('supertest');
const Joi = require('@hapi/joi');

let app = require('../../app');

const Admin = require('../../models/admin.model');
const Client = require('../../models/client.model');
const Merchant = require('../../models/merchant.model');

const { verify: verifyToken } = require('../../src/token');

let db;

let admin;
let client;
let merchant;

const user = {
	username: "test",
	password: "test1234"
};

const accountTypes = [ 'admin', 'client', 'merchant' ];

beforeAll(done => {
	require('../../src/database')('_test_auth')(conn => {
		db = conn;

		(async () => {
			admin = new Admin.model(user);
			await admin.save();

			client = new Client.model({ ...user, createdBy: admin._id });
			await client.save();

			merchant = new Merchant.model({ ...user, createdBy: admin._id });
			await merchant.save();
		})().catch(console.error)
			.finally(() => done());
	});
});

describe('Tests the "login" API endpoint', () => {

	accountTypes.map(type => {
		it(`Gets a valid token for "${type}" account`, () => {
			return request(app)
					.post('/auth')
					.send({ ...user, type })
					.expect(200)
					.expect(({ body: { token } }) => {
						const valid = verifyToken(token, '127.0.0.1');

						if(!valid) throw Error(`Invalid token for account type "${type}"`);
					});
		});
	});

	it('Fails to login due to incorrect password', () => {
		return request(app)
				.post('/auth')
				.send({ username: "abc", password: "abcdefgh", type: "admin" })
				.expect(403);
	});

	it('Fails to login due to invalid account type', () => {
		return request(app)
				.post('/auth')
				.send({ ...user, type: "thisTypeDoesntExists" })
				.expect(400);
	});

});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});