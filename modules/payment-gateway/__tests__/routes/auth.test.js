const request = require('supertest');
const Joi = require('@hapi/joi');

let app = require('../../app');

const Admin = require('../../models/admin.model');
const Client = require('../../models/client.model');
const Merchant = require('../../models/merchant.model');
const Token = require('../../models/token.model');

const token = require('../../src/token');

let db;

const accounts = {};

const user = {
	username: "test",
	password: "test1234"
};

const accountTypes = [ 'admin', 'client', 'merchant' ];

beforeAll(done => {
	require('../../src/database')('_test_auth')(conn => {
		db = conn;

		(async () => {
			accounts.admin = new Admin.model(user);
			await accounts.admin.save();

			accounts.client = new Client.model({ ...user, createdBy: accounts.admin._id });
			await accounts.client.save();

			accounts.merchant = new Merchant.model({ ...user, createdBy: accounts.admin._id });
			await accounts.merchant.save();
			
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
					.then(({ body: { token: tkn } }) => Promise.all([ token.verify(tkn, '127.0.0.1'), Promise.resolve(tkn) ]))
					.then(([ valid, token ]) => Token.model.findOne({ token }))
					.then(tokenModel => {
						expect(tokenModel).toBeTruthy();
						expect(tokenModel.expiresAt - tokenModel.createdAt).toBeLessThanOrEqual(1 * 60 * 60 * 1000 + 10);
						expect(tokenModel.expiresAt - tokenModel.createdAt).toBeGreaterThan(0.5 * 60 * 60 * 1000);
					});
		});

		it(`Gets a valid extended token for "${type}" account`, () => {
			return request(app)
					.post('/auth')
					.send({ ...user, type, extended: true })
					.expect(200)
					.then(({ body: { token: tkn } }) => Promise.all([ token.verify(tkn, '127.0.0.1'), Promise.resolve(tkn) ]))
					.then(([ valid, token ]) => Token.model.findOne({ token }))
					.then(tokenModel => {
						expect(tokenModel).toBeTruthy();
						expect(tokenModel.expiresAt - tokenModel.createdAt).toBeLessThanOrEqual(30 * 24 * 60 * 60 * 1000 + 10);
						expect(tokenModel.expiresAt - tokenModel.createdAt).toBeGreaterThan(1 * 60 * 60 * 1000);
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

describe('Tests the "check API endpoint', () => {

	accountTypes.map(type => {
		it(`Validates a token for "${type}"`, async () => {
			const tkn = await token(accounts[type].id, type, '127.0.0.1');

			await request(app)
					.get('/auth/check')
					.set('Authorization', `Bearer ${tkn}`)
					.expect(200);
		});
	});

});

afterAll(done => {
	if(db) db.drop().finally(() => db.close().finally(() => done())).catch(console.error);
});