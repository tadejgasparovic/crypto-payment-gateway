import config from './systemConfig';

export default {
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