const mongoose = require('mongoose');
const { Schema, Schema: { Types: { ObjectId } } } = mongoose;
const mongooseHidden = require('mongoose-hidden')({ defaultHidden: { __v: true } });
const Joi = require('@hapi/joi');
const _ = require('lodash');

const config = require('../src/config');

const paymentSchema = new Schema({
	merchant: {
		type: ObjectId,
		ref: "merchants",
		required: true,
		hideJSON: true
	},
	customerEmail: {
		type: String,
		required: true,
		validate: value => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value)
	},
	address: {
		type: String,
		required: true
	},
	amount: {
		type: Number,
		required: true
	},
	currency: {
		type: String,
		required: true,
		validate: value => /[a-zA-Z0-9]{1,5}/.test(value),
		set: value => value.toUpperCase()
	},
	statusHook: {
		type: String,
		validate: value => /https?:\/\/[a-zA-Z0-9]+\.[a-zA-Z]{2,}.*/.test(value),
		hide: true
	},
	confirmations: {
		type: Number,
		required: true,
		default: 0
	},
	createdAt: {
		type: Date,
		default: Date.now,
		required: true
	},
	paidAt: {
		type: Date,
		default: null
	},
	receivedAt: {
		type: Date,
		default: null
	},
	expiresAt: {
		type: Date,
		default: () => Date.now() + (config.paymentWindowMins * 60 * 1000),
		required: true
	}
});

paymentSchema.plugin(mongooseHidden);

module.exports = {
	model: mongoose.model('payments', paymentSchema),
	schema: Joi.object().keys({
		merchantId: Joi.string().hex().length(24).required(),
		amount: Joi.number().positive().required(),
		currency: Joi.string().regex(/^[a-zA-Z0-9]{1,5}$/).required(),
		statusHook: Joi.string().uri({ scheme: /https?/, allowQuerySquareBrackets: true }).regex(/https?:\/\/.*\..*/),
		customerEmail: Joi.string().email({ minDomainSegments: 2 }).required()
	})
};