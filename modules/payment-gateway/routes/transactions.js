const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const debug = require('debug')('payment-gateway:transactionsAPI');

const rescanAsyncWorker = require('../src/rescanAsyncWorker');
const config = require('../src/config');

const coinAdapter = require('../src/coin-adapters');

const validation = require('../src/middleware/validation');
const auth = require('../src/middleware/auth');

const Rescan = require('../models/rescan.model');

const schema = Joi.object().keys({
	txid: Joi.string().hex().required(),
	currency: Joi.string().regex(/^[A-Z0-9]{1,5}$/).required(),
	secret: Joi.string()
});

router.post('/', validation(schema), async (req, res) => {
	
	if(req.valid.secret !== config.txPushSecret)
	{
		res.status(403).send("Unauthorized");
		return;
	}

	try
	{
		const coin = await coinAdapter(req.valid.currency);

		if(!coin)
		{
			res.status(404).send("Not Found");
			return;
		}

		try
		{
			const tx = await coin.getRawTransaction(req.valid.txid);

			if(!tx) return res.status(500).send("Internal Error");

			const { vout, confirmations, time } = tx;

			for(let out of vout) await rescanAsyncWorker.updatePayment(out, confirmations, time);

			res.status(200).send("OK");
		}
		catch(e)
		{
			debug(`Failed to get transaction "${req.valid.txid}"`);
			debug(e);
			res.status(500).send("Internal Error");
		}
	}
	catch(e)
	{
		debug(`Walletnotify failed for currency "${req.valid.currency}" with TX ${req.valid.txid}!`);
		debug(e);
		res.status(500).send("Internal Error");
	}
});

const rescanSchema = Joi.object().keys({
	block: [ Joi.string().regex(/^[a-fA-F0-9]{64}$/).required(), Joi.number().integer().min(0).required() ],
	currency: Joi.string().regex(/^[A-Z0-9]{1,5}$/).required()
});

// Start a rescan
router.post('/rescan', auth('admin'), validation(rescanSchema), async (req, res) => {
	const { currency, block } = req.valid;

	try
	{
		let activeRescan = await Rescan.model.findOne({ status: 'running' });

		if(activeRescan)
		{
			res.status(409).send("Conflict");
			return;
		}

		const coin = await coinAdapter(currency);

		if(!coin)
		{
			res.status(404).send("Not Found");
			return;
		}

		let firstBlock = block;

		if(/^[a-fA-F0-9]{64}$/.test(block))
		{
			const tmpBlock = await coin.getBlock(block);

			if(!tmpBlock || !tmpBlock.height)
			{
				res.status(500).send("Internal Error");
				return;
			}

			firstBlock = tmpBlock.height;
		}

		activeRescan = new Rescan.model({
			currency,
			firstBlock
		});

		await activeRescan.save();

		rescanAsyncWorker(activeRescan);
		
		res.status(200).send(activeRescan);
	}
	catch(e)
	{
		debug(`Couldn't start a rescan from block ${block} for currency ${currency}`);
		debug(e);
		if(!res.finished) res.status(500).send("Internal Error");
	}
});

// Stop a rescan
router.post('/rescan/:id/stop', auth('admin'), async (req, res) => {
	try
	{
		const { id } = req.params;

		if(!/[0-9a-fA-F]{24}/.test(id))
		{
			res.status(400).send({ error: "Invalid rescan ID" });
			return;
		}

		const activeRescan = await Rescan.model.findById(id);

		if(!activeRescan)
		{
			res.status(404).send("Not Found");
			return;
		}

		if(activeRescan.status !== 'running')
		{
			res.status(400).send({ error: "Can't stop a rescan which isn't running" });
			return;
		}

		if(!rescanAsyncWorker.isRunning())
		{
			res.status(400).send({ error: "No active worker for this rescan" });
			return;
		}

		rescanAsyncWorker.stop(activeRescan => res.status(200).send(activeRescan));
	}
	catch(e)
	{
		debug(`Couldn't stop a rescan from block ${block} for currency ${currency}`);
		debug(e);
		res.status(500).send("Internal Error");
	}
});

// Get a list of rescans
router.get('/rescan', auth('admin'), async (req, res) => {

	const rescans = await Rescan.model.find({});

	res.status(200).send(rescans);
});

module.exports = router;