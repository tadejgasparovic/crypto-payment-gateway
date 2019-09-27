const mongoose = require('mongoose');
const { Schema, Schema: { Types: { ObjectId } } } = mongoose;
const mongooseHidden = require('mongoose-hidden')({ defaultHidden: { __v: true } });

const rescanSchema = new Schema({
	currency: {
		type: String,
		required: true,
		validate: value => /[a-zA-Z0-9]{1,5}/.test(value),
		set: value => value.toUpperCase()
	},
	blocksLeft: {
		type: Number,
		required: true,
		default: -1
	},
	firstBlock: {
		type: Number,
		required: true
	},
	currentBlock: {
		type: Number,
		required: true,
		default: function() { return this.firstBlock; }
	},
	status: {
		type: String,
		required: true,
		enum: [ 'created', 'running', 'stopped', 'finished', 'failed' ],
		default: 'created'
	},
	error: {
		type: [ String ],
		required: true,
		default: []
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	doneAt: Date
});

rescanSchema.index({ currency: 1, status: 1 });

rescanSchema.plugin(mongooseHidden);

module.exports = {
	model: mongoose.model('rescans', rescanSchema),
	schema: null
};