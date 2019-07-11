const { verify: verifyToken, decode: decodeToken } = require('../token');


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
	else if(!verifyToken(parseAuthorization(), req.connection.remoteAddress)) res.status(403).send("Unauthorized");
	else
	{
		const decodedToken = decodeToken(parseAuthorization());

		if(!authorizedAccountTypes.includes(decodedToken.type))
		{
			res.status(403).send("Unauthorized");
			return;
		}

		const { id, type } = decodedToken;

		const Account = accountTypes[type];

		Account.findById(id)
				.then(account => {
					if(!account) res.status(403).send("Unauthorized");

					req.token = decodedToken;
					next();
				})
				.catch(e => res.status(500).send("Internal Error"));
	}
}