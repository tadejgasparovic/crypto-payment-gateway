#!/usr/bin/env node

const debug = require('debug')('payment-gateway:cron');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const config = require('../config');

console.time('Total time');

const jobQueue = [];

// Open a db connection and setup the mailer & notifications
require('../database')()(db => {
	require('../email').verify().then(() => {
		
		const unhookNotifications = require('../notifications');
		process.on('exit', unhookNotifications);

		scheduler(db);
	}).catch(e => debug(`Cron scheduler failed to setup. ${e}`));
});

function scheduler(db)
{
	_.keys(config.cronJobPeriods).forEach(job => {
		if(!fs.existsSync(path.resolve(`src/jobs/${job}.job.js`)))
		{
			debug(`WARNING: Job '${job}' is configured, but doesn't exist!`);
			return;
		}

		const period = config.cronJobPeriods[job];

		if(Math.floor(new Date().getMinutes() % period) !== 0) return;

		const work = require(path.resolve(`src/jobs/${job}.job`));

		let promise;

		if(typeof work === 'function' && work.constructor.name === 'AsyncFunction') promise = work();
		else if(typeof work === 'object' && work.constructor === Promise) promise = work;
		else if(typeof work === 'function')
		{
			promise = new Promise((resolve, reject) => {
				try
				{
					work();
					resolve();
				}
				catch(e)
				{
					reject(e);
				}
			});
		}
		else debug(`WARNING: Job '${job}' didn't export a function (sync or async) or a Promise!`);

		if(promise) jobQueue.push(promise);
	});

	Promise.all(jobQueue)
			.finally(() => {
				debug('Cron jobs finished!');
				console.timeEnd('Total time');

				db.close(() => process.exit(0));
			});
}