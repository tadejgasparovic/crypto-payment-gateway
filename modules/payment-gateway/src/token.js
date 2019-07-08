const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const ipUtils = require('ip');

const privKeyPath = path.resolve(process.env.IS_DOCKER ? '/payment-gateway/ssl/default.key' : '../ssl/default.key');

const privKey = fs.readFileSync(privKeyPath);

const makeToken = (id, type, ip) => jwt.sign({ id, type, ip }, privKey);

makeToken.verify = (token, ip) => {
	try
	{
		const decoded = jwt.verify(token, privKey);

		return ipUtils.isEqual(decoded.ip, ip);
	}
	catch(e)
	{
		return false;
	}
}

makeToken.decode = token => jwt.decode(token);

module.exports = makeToken;