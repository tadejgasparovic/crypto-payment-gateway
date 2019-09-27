const debug = require('debug')('payment-gateway:authMiddleware');

const { verify: verifyToken, decode: decodeToken, extend: extendToken } = require('../token');


const accountTypes = {
	client: require('../../models/client.model').model,
	merchant: require('../../models/merchant.model').model,
	admin: require('../../models/admin.model').model
};

module.exports = (...authorizedAccountTypes) => (req, res, next) => {

	const { authorization } = req.headers;

	const parseAuthorization = () => {
		const [type = "", token = ""] = authorization.split(' ');

		return type === "Bearer" ? token : "";
	};

	if(!authorization) res.status(403).send("Unauthorized");
	else
	{
		const token = parseAuthorization();
		const decodedToken = decodeToken(token);

		verifyToken(token, req.connection.remoteAddress)
				.then(() => {
					const { id, type } = decodedToken;

					if(!authorizedAccountTypes.includes(type))
					{
						res.status(403).send("Unauthorized");
						return;
					}

					const Account = accountTypes[type];

					return Account.findById(id)
							.catch(e => res.status(500).send("Internal Error"));
				})
				.then(account => {
					if(!account) res.status(403).send("Unauthorized");
					if(res.finished) return;

					const finish = () => {
							req.token = decodedToken;
							req.rawToken = token;
							next();
						};

					extendToken(token)
						.then(finish)
						.catch(e => {
							debug(`Failed to extend token ${token}`);
							debug(e);
							finish();
						});
				})
				.catch(e => {
					debug(e);
					if(!res.finished) res.status(403).send("Unauthorized")
				});
	}
}