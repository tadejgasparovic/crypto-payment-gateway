const Joi = require('@hapi/joi');
const _ = require('lodash');

module.exports = (schema, includeParams, includeFields, makeSchema) => (req, res, next) => {
	const { body, params } = req;

	let data = {};

	let customSchema = schema;

	if(typeof makeSchema === 'function') customSchema = makeSchema(req);
	else if(makeSchema && typeof makeSchema === 'object' && makeSchema.isJoi) customSchema = makeSchema;

	if(includeFields && typeof includeFields === 'object' && includeFields.constructor === Array) _.assign(data, _.pick(body, includeFields));
	else if(includeFields) _.assign(data, _.fromPairs(_.map(_.toPairs(includeFields), ([ key, value ]) => [ value, body[key] ])));
	else _.assign(data, body);

	if(includeParams && typeof includeParams === 'object' && includeParams.constructor === Array) _.assign(data, _.pick(params, includeParams));
	else if(includeParams && typeof includeParams === 'object') _.assign(data, _.fromPairs(_.map(_.toPairs(includeParams), ([ key, value ]) => [ value, params[key] ])));

	const { error } = Joi.validate(data, customSchema);

	if(error)
	{
		let message = "Body validation failed";

		if(error.details && error.details.length > 0 && error.details[0].message) message = error.details[0].message;
		else if(error.message) message = error.message;

		res.status(400).json({ error: message }).end();
	}
	else
	{
		req.valid = data;
		next();
	}
}