function newError(data, ...args)
{
	if(data.includes('act(...)')) return;

	original(data, ...args);
}

const original = console.error;

console.error = newError;