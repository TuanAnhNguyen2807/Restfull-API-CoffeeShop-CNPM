const mongoose = require("mongoose");

const storageSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		default: "",
	},
	quantity: Number,
    unit: String,
	dateUpdate: {
		type: Date,
		default: Date.now,
	},
});

const Product = mongoose.model("Storage", storageSchema);

module.exports = Product;
