const { EventEmitter } = require('events');

class PaymentEventEmitter extends EventEmitter
{
	created(payment, cb)
	{
		this.emit('created', payment, cb);
	}

	received(payment, cb)
	{
		this.emit('received', payment, cb);
	}

	confirmation(payment, cb)
	{
		this.emit('confirmation', payment, cb);
	}

	finalized(payment, cb)
	{
		this.emit('finalized', payment, cb);
	}

	expired(payment, cb)
	{
		this.emit('expired', payment, cb);
	}

	looseFunds(payment, amount, cb)
	{
		this.emit('loosefunds', payment, amount, cb);
	}
}

module.exports = new PaymentEventEmitter;