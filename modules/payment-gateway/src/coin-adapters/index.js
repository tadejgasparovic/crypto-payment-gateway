const debug = require('debug')('payment-gateway:makeCoinAdapter');

const config = require('../config');

const Coin = require('../../models/coin.model');

async function coinAdapter(coin)
{
	// Load the coin spec from the DB
	try
	{
		const coinSpec = await Coin.model.findOne({ symbol: coin.toUpperCase() }, [ 'adapter', 'adapterProps' ]).exec();

		if(!coinSpec)
		{
			debug(`Coin "${coin}" not found!`);
			return null;
		}

		// Compile the spec into a coin adapter and resolve the promise
		return compileSpec(coinSpec);
	}
	catch(e)
	{
		debug(`Cannot create coin adapter! An error occured while looking for coin "${coin}"`);
		debug(e);
		throw e;
	}
}

function compileSpec(spec)
{
	const supportedAdapters = config.enabledAdapters || [ 'rpc' ];
	if(!supportedAdapters.includes(spec.adapter)) throw Error(`Unsupported coin adapter ${spec.adapter}!`);

	const adapterProps = spec.adapterProps[spec.adapter];
	if(!adapterProps) throw Error(`Unconfigured coin adapter "${spec.adapter}"!`);

	const adapter = require(`./${spec.adapter}.adapter`);
	if(!adapter) throw Error(`Unimplemented coin adapter "${spec.adapter}"!`);

	return new adapter(adapterProps);
}

module.exports = coinAdapter;