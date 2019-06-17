const { verify: verifyToken, decode: decodeToken } = require('../token');

module.exports = (...authorizedAccountTypes) => (req, res, next) => {

	const { authorization } = req.headers;

	const parseAuthorization = () => {
		const [type = "", token = ""] = authorization.split(' ');

		return type === "Bearer" ? token : "";
	};

	if(!authorization) res.status(403).end();
	else if(!verifyToken(parseAuthorization(), req.connection.remoteAddress)) res.status(403).end();
	else
	{
		const decodedToken = decodeToken(parseAuthorization());

		if(!authorizedAccountTypes.includes(decodedToken.type))
		{
			res.status(403).end();
			return;
		}

		req.token = decodedToken;
		
		next();
	}
}