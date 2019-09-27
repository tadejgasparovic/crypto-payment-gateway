const mongoose = require('mongoose');
const { Schema, Schema: { Types: { ObjectId } } } = mongoose;
const mongooseHidden = require('mongoose-hidden')({ defaultHidden: { __v: true } });

const tokenSchema = new Schema({
	token: {
		type: String,
		required: true,
		unique: true
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	expiresAt: {
		type: Date,
		required: true,
		default: () => Date.now() + 1 * 60 * 60 * 1000
	},
	extended: {
		type: Boolean,
		required: true,
		default: false
	}
});

tokenSchema.plugin(mongooseHidden);

module.exports = {
	model: mongoose.model('tokens', tokenSchema),
	schema: null
};