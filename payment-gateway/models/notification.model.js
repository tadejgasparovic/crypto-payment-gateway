const mongoose = require('mongoose');
const { Schema, Schema: { Types: { ObjectId } } } = mongoose;
const mongooseHidden = require('mongoose-hidden')({ defaultHidden: { __v: true } });

const config = require('../src/config');

const notificationSchema = new Schema({
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
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	sentAt: Date
});

notificationSchema.index({ payment: 1, type: 1 });

notificationSchema.plugin(mongooseHidden);

module.exports = {
	model: mongoose.model('notifications', notificationSchema)
};