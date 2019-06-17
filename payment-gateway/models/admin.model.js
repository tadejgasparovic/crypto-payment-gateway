const mongoose = require('mongoose');
const { Schema, Schema: { Types: { ObjectId } } } = mongoose;
const mongooseHidden = require('mongoose-hidden')({ defaultHidden: { __v: true } });
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');

const adminSchema = new Schema({
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
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	}
});

adminSchema.plugin(mongooseHidden);

module.exports = {
	model: mongoose.model('admins', adminSchema),
	schema: Joi.object().keys({
		username: Joi.string().min(3).max(255).required(),
		password: Joi.string().min(8).max(255).required()
	})
};