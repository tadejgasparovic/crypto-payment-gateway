const debug = require('debug')('payment-gateway:token');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const ipUtils = require('ip');

const privKeyPath = path.resolve(process.env.IS_DOCKER ? '/payment-gateway/ssl/default.key' : '../ssl/default.key');

const privKey = fs.readFileSync(privKeyPath);

const Token = require('../models/token.model').model;

const makeToken = async (id, type, ip, extended = false) => {
	const token = jwt.sign({ id, type, ip, extended }, privKey);

	// Extended tokens are valid for 1 month
	const expiresAt = Date.now() +  (extended ? 30 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000);

	try
	{
		const tokenModel = new Token({ token, extended, expiresAt });
		await tokenModel.save();
		return token;
	}
	catch(e)
	{
		debug(`Failed to save token for user ${id}:${type}:${ip}`);
		debug(e);
		throw e;
	}
}

makeToken.verify = async (token, ip) => {
	const tokenModel = await Token.findOne({ token });

	if(!tokenModel || tokenModel.expiresAt - new Date() <= 0) throw Error("Unauthorized");

	const decoded = jwt.verify(token, privKey);

	if(!ipUtils.isEqual(decoded.ip, ip)) throw Error("Unauthorized");
}

makeToken.decode = token => jwt.decode(token);

makeToken.invalidate = token => Token.deleteOne({ token });

makeToken.extend = async token => {
	const tokenModel = await Token.findOne({ token });

	tokenModel.expiresAt = Date.now() + (tokenModel.extended ? 30 * 24 : 1) * 60 * 60 * 1000;
	await tokenModel.save();
}

module.exports = makeToken;