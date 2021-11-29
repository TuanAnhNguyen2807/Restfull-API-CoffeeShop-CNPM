const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		default: "",
	},
	image: {
		type: String,
		default: "",
	},
	images: [
		{
			type: String,
		},
	],
	price: {
		type: Number,
		default: 0,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category",
	},
	rating: {
		type: Number,
		default: 0,
	},
	isFeatured: {
		type: Boolean,
		default: false,
	},
	dateCreated: {
		type: Date,
		default: Date.now,
	},
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
