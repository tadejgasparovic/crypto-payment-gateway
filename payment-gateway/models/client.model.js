const mongoose = require('mongoose');
const { Schema, Schema: { Types: { ObjectId } } } = mongoose;
const mongooseHidden = require('mongoose-hidden')({ defaultHidden: { __v: true } });
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');

const clientSchema = new Schema({
	username: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 255,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 50,
		maxlength: 72,
		set: value => bcrypt.hashSync(value, 10),
		hide: true
	},
	createdBy: {
		type: ObjectId,
		ref: "admins",
		required: true,
		hide: true
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	}
});

clientSchema.plugin(mongooseHidden);

module.exports = {
	model: mongoose.model('clients', clientSchema),
	schema: Joi.object().keys({
		username: Joi.string().min(3).max(255).required(),
		password: Joi.string().min(8).max(255).required()
	})
};