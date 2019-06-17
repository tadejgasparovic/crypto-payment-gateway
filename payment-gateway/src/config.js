const path = require('path');

const config = require(path.resolve(process.env.CONFIG || '/payment-gateway/config/config.js'));

module.exports = {
	...config,
	...setters()
};

function setters()
{
	const mockSetters = {};

	for(let prop in config)
	{
		mockSetters[`set${prop[0].toUpperCase()}${prop.substring(1)}`] = function(value) {
			this[prop] = value;
		}
	}

	return mockSetters;
}