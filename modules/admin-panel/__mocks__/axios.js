const mock = [ 'get', 'post', 'delete' ];

const instances = new Map;

function create(config)
{
	if(instances.has(config)) return instances.get(config);

	return newInstance(config);
}

function newInstance(config = {})
{
	const instance = {
		mocks: {}
	};

	for(let m of mock)
	{
		Object.assign(instance, { [m]: jest.fn() });
		Object.assign(instance.mocks, { [m]: jest.fn() });
	}

	Object.assign(instance, { create: jest.fn(create) });
	Object.assign(instance, {

		defaults: {
			headers: {
				common: {}
			}
		},

		clear: function () { Object.values(this.mocks).forEach(fn => fn.mockClear()) },
		reset: function () { Object.values(this.mocks).forEach(fn => fn.mockReset()) }
	});

	instances.set(config, instance);

	return instance;
}

const defaultInstance = newInstance();

Object.assign(defaultInstance, { instances });

export default defaultInstance;