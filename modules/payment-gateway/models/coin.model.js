const mongoose = require('mongoose');
const { Schema, Schema: { Types: { ObjectId } } } = mongoose;
const mongooseHidden = require('mongoose-hidden')({ defaultHidden: { __v: true } });
const Joi = require('@hapi/joi');

const coinSchema = new Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 255
	},
	symbol: {
		type: String,
		required: true,
		validate: value => /[a-zA-Z0-9]{1,5}/.test(value),
		set: value => value.toUpperCase(),
		unique: true
	},
	adapter: {
		type: String,
		required: true,
		enum: [ 'rpc' ],
		default: 'rpc'
	},
	adapterProps: {
		rpc: {
			host: {
				type: String,
				required: true
			},
			port: {
				type: Number,
				required: true,
				min: 0,
				max: 65535
			},
			user: {
				type: String,
				required: true
			},
			password: {
				type: String,
				required: true
			}
		}
	},
	createdBy: {
		type: ObjectId,
		ref: "clients",
		required: true,
		hideJSON: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		required: true
	}
});

coinSchema.plugin(mongooseHidden);

module.exports = {
	model: mongoose.model('coins', coinSchema),
	schema: Joi.object().keys({
		name: Joi.string().min(2).required(),
		symbol: Joi.string().alphanum().min(1).max(5).required(),
		adapter: Joi.string().valid('rpc').required(),
		adapterProps: Joi.object().required()
	})
};