const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const customerSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		default: "",
	},
});
customerSchema.plugin(uniqueValidator);
customerSchema.index({'$**': 'text'});
const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
