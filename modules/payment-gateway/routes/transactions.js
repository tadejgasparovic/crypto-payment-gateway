const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const debug = require('debug')('payment-gateway:transactionsAPI');

const config = require('../src/config');

const coinAdapter = require('../src/coin-adapters');

const Payment = require('../models/payment.model');

const PaymentEvents = require('../src/events/payment.emitter');

router.post('/', (req, res) => {
	const { error } = Joi.validate(req.body, Joi.object().keys({
		txid: Joi.string().hex().required(),
		currency: Joi.string().regex(/^[A-Z0-9]{1,5}$/).required()
	}));

	if(error) return res.status(400).json({ error: (error.details && error.details.length > 0) ? error.details[0].message : "Body validation failed" }).end();

	// Fetch the full tansaction
	coinAdapter(req.body.currency).then(coin => {
		if(!coin)
		{
			res.status(404).send("Not Found");
			return;
		}

		(async () => {
			try
			{
				const tx = await coin.getRawTransaction(req.body.txid);

				if(!tx) return res.status(500).send("Internal Error");

				const { vout, confirmations, time } = tx;

				for(let out of vout) await updatePayment(out, confirmations, time);

				res.status(200).send("OK");
			}
			catch(e)
			{
				debug(`Failed to get transaction "${req.body.txid}"`);
				debug(e);
				res.status(500).send("Internal Error");
			}
		})();

	}).catch(e => {
		debug(`Walletnotify failed for currency "${req.body.currency}"!`);
		debug(e);
		res.status(500).send("Internal Error");
	});
});

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

module.exports = router;