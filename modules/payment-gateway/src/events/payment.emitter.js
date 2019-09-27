const { EventEmitter } = require('events');

class PaymentEventEmitter extends EventEmitter
{
	constructor()
	{
		super();
		this._countResolvedEvents = this._countResolvedEvents.bind(this);
	}

	created(payment, cb)
	{
		const countedCb = this._countResolvedEvents('created', cb);
		this.emit('created', payment, countedCb);
	}

	received(payment, cb)
	{
		const countedCb = this._countResolvedEvents('received', cb);
		this.emit('received', payment, countedCb);
	}

	confirmation(payment, cb)
	{
		const countedCb = this._countResolvedEvents('confirmation', cb);
		this.emit('confirmation', payment, countedCb);
	}

	finalized(payment, cb)
	{
		const countedCb = this._countResolvedEvents('finalized', cb);
		this.emit('finalized', payment, countedCb);
	}

	expired(payment, cb)
	{
		const countedCb = this._countResolvedEvents('expired', cb);
		this.emit('expired', payment, countedCb);
	}

	looseFunds(payment, amount, cb)
	{
		const countedCb = this._countResolvedEvents('loosefunds', cb);
		this.emit('loosefunds', payment, amount, countedCb);
	}

	_countResolvedEvents(event, cb)
	{
		if(typeof cb !== 'function') return cb;

		const listenerCount = this.listenerCount(event);

		let invokedCount = 0;

		const newCb = err => {
			invokedCount++;

			if(invokedCount >= listenerCount) return cb && cb(err);
		}

		return newCb;
	}
}

module.exports = new PaymentEventEmitter;