const mongoose = require('mongoose');
const { Schema, Schema: { Types: { ObjectId } } } = mongoose;
const mongooseHidden = require('mongoose-hidden')({ defaultHidden: { __v: true } });

const config = require('../src/config');

const statusHookSchema = new Schema({
	payment: {
		type: ObjectId,
		ref: "payments",
		required: true
	},
	type: {
		type: String,
		required: true,
		enum: [ 'created', 'received', 'finalized', 'expired' ]
	},
	retries: {
		type: Number,
		required: true,
		default: 0
	},
	statusCode: {
		type: Number,
		required: true,
		default: 0
	},
	responseMessage: {
		type: String,
		default: ""
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	lastRequestAt: Date
});

statusHookSchema.index({ payment: 1, type: 1 });

statusHookSchema.plugin(mongooseHidden);

module.exports = {
	model: mongoose.model('statusHooks', statusHookSchema)
};