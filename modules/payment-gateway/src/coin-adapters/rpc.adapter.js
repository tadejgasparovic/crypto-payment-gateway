const { Client } = require('json-rpc2');

class RpcAdapter
{
	constructor({ host, port, user, password })
	{
		this.rpcClient = Client.$create(port, host, user, password);

		this.newAddress = this.newAddress.bind(this);
		this.getRawTransaction = this.getRawTransaction.bind(this);
		this.getBlock = this.getBlock.bind(this);
		this.getBlockCount = this.getBlockCount.bind(this);

		this._promisifyCall = this._promisifyCall.bind(this);
	}

	newAddress()
	{
		return this._promisifyCall('getnewaddress');
	}

	getRawTransaction(txid, verbose = 1)
	{
		return this._promisifyCall('getrawtransaction', [ txid, verbose ? 1 : 0 ]);
	}

	getBlock(hash)
	{
		return this._promisifyCall('getblock', [ hash ]);
	}

	getBlockHash(height)
	{
		return this._promisifyCall('getblockhash', [ height ]);
	}

	getBlockCount()
	{
		return this._promisifyCall('getblockcount', []);
	}

	_promisifyCall(method, args = [])
	{
		return new Promise((resolve, reject) => {
			this.rpcClient.call(method, args, (err, result) => err ? reject(err) : resolve(result));
		});
	}
}

module.exports = RpcAdapter;