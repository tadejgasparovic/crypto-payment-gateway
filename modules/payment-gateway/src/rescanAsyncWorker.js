const debug = require('debug')('payment-gateway:rescanAsyncWorker');
const _ = require('lodash');

const coinAdapter = require('./coin-adapters');
const config = require('./config');

const Rescan = require('../models/rescan.model');
const Payment = require('../models/payment.model');

const PaymentEvents = require('./events/payment.emitter');

let checkedForActive = false;
let running = false;
let activeRescan = null;
let finallyCallback = null;

(async () => {

	const activeRescan = await Rescan.model.findOne({ status: 'running' });

	checkedForActive = true;

	if(!activeRescan) return;

	await rescanAsyncWorker(activeRescan);

})();

rescanAsyncWorker.stop = cb => {
	if(!running || !activeRescan) throw Error("No active rescan!");

	if(typeof cb === 'function') finallyCallback = cb;

	activeRescan.status = 'stopped';
	running = false;
}
rescanAsyncWorker.isRunning = () => running;
rescanAsyncWorker.updatePayment = updatePayment;

async function rescanAsyncWorker(rescan)
{
	try
	{
		if(running || activeRescan) throw Error("Rescan already running!");
		if(!checkedForActive) throw Error("Trying to start rescan before worker init");

		running = true;
		activeRescan = rescan;

		activeRescan.status = 'running';
		await Rescan.model.updateOne({ _id: activeRescan._id }, activeRescan);

		const coin = await coinAdapter(activeRescan.currency);

		if(!coin) throw Error(`Coin ${activeRescan.currency} for rescan not found`);


		let blockHash = await coin.getBlockHash(activeRescan.currentBlock);

		if(!blockHash) throw Error("Couldn't get the current block hash");

		let block;

		let blockCount = await coin.getBlockCount();

		do
		{
			block = await coin.getBlock(blockHash);

			if(!block) throw Error(`Couldn't get block ${activeRescan.blocksLeft}:${blockHash}`);

			const { tx: blockTransactions } = block;

			for(let transactionHash of blockTransactions)
			{
				try
				{
					const transaction = await coin.getRawTransaction(transactionHash);

					if(!transaction) throw Error(`Couldn't get TX ${transactionHash}`);

					const { vout, confirmations, time } = transaction;

					for(let out of vout)
					{
						try
						{
							await updatePayment(out, confirmations, time);
						}
						catch(e)
						{
							const idx = _.indexOf(vout, out);
							debug(`Failed to process TX ${activeRescan.currency}:${transactionHash} vout ${idx} at block ${activeRescan.blocksLeft}`);
							debug(e);

							activeRescan.error.push(`Failed to process TX ${transactionHash} vout ${idx} Error: ${e.message || "General failure"}`);
						}
					}
				}
				catch(e)
				{
					debug(`Failed to process TX ${activeRescan.currency}:${transactionHash} at block ${activeRescan.blocksLeft}`);
					debug(e);

					activeRescan.error.push(`Failed to process TX ${transactionHash} Error: ${e.message || "General failure"}`);
				}
			}

			// Poll the node for the block count every 100 blocks
			activeRescan.blocksLeft =
					(block.height % 100 === 0 || (blockCount - block.height) < 0) ?
						((blockCount = await coin.getBlockCount()) - block.height) :
						(blockCount - block.height);

			activeRescan.currentBlock = block.height;

			try
			{
				await activeRescan.save();
			}
			catch(e)
			{
				debug(`Failed to save rescan ${activeRescan._id}`);
				debug(e);
			}
		}
		while((blockHash = block.nextblockhash) && running);

		if(activeRescan.status === 'running') activeRescan.status = 'finished';
	}
	catch(e)
	{
		debug(`Rescan for ${activeRescan.currency} from block ${activeRescan.firstBlock} failed at block ${activeRescan.blocksLeft}`);
		debug(e);

		activeRescan.error.push(e.message || "General failure");
		activeRescan.status = 'failed';
	}
	finally
	{
		try
		{
			activeRescan.doneAt = new Date();
			await Rescan.model.updateOne({ _id: activeRescan._id }, activeRescan);
		}
		catch(e)
		{
			debug(`Failed to save active rescan ${activeRescan.currency}:${activeRescan.firstBlock}`);
			debug(e);
		}
		finally
		{
			running = false;

			if(typeof finallyCallback === 'function') finallyCallback(activeRescan);

			activeRescan = null;
		}
	}
}

async function updatePayment({ value, scriptPubKey }, confirmations, time)
{
	if(!value || !scriptPubKey || !scriptPubKey.addresses || scriptPubKey.addresses.constructor !== Array) return;

	for(let address of scriptPubKey.addresses)
	{
		const payment = await Payment.model.findOne({ address }).exec();

		if(!payment) continue;

		// If the payment has expired, ignore it
		if(payment.expiresAt < new Date(time * 1000))
		{
			debug(`Received TX for expired payment "${payment.id}"!`);
			PaymentEvents.looseFunds(payment, value);
			continue;
		}

		// If the value is too low, ignore it
		if(value < payment.amount)
		{
			debug(`TX for payment "${payment.id}" received, but ${value} ${payment.currency} doesn't fill the required ${payment.amount} ${payment.currency}! Ignoring.`);
			PaymentEvents.looseFunds(payment, value);
			continue;
		}

		// If the payment is already finalized, ignore it
		if(payment.paidAt)
		{
			debug(`TX received for payment "${payment.id}", but payment is already finalized. Ignoring.`);
			PaymentEvents.looseFunds(payment, value);
			continue;
		}

		const eventDispatchOrder = [ 'received', 'confirmation', 'finalized' ]; // Helps us fire queued events in the correct order
		const eventQueue = []; // Track the events we need to fire after we're done


		if(confirmations > payment.confirmations) eventQueue.push('confirmation');

		payment.confirmations = confirmations;

		if(confirmations < config.requiredConfirmations && !payment.receivedAt)
		{
			payment.receivedAt = Date.now();
			eventQueue.push('received');
		}
		else if(confirmations >= config.requiredConfirmations && !payment.paidAt)
		{
			if(!payment.receivedAt)
			{
				payment.receivedAt = Date.now();
				eventQueue.push('received');
			}
			
			payment.paidAt = Date.now();
			eventQueue.push('finalized');
		}

		await payment.save();

		// Fire all queued events in the correct order
		eventDispatchOrder.forEach(e => {
			if(eventQueue.includes(e) && typeof PaymentEvents[e] === 'function') PaymentEvents[e](payment);
		});
	}
}

module.exports = rescanAsyncWorker;