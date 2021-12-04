const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
	orderItems: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "OrderItem",
			require: true,
		},
	],
	shippingAddress: {
		type: String,
		require: true,
	},
	address: {
		type: String,
		require: true,
	},
	status: {
		type: String,
		require: true,
		default: "Pending",
	},
	totalPrice: {
		type: Number,
	},
	customer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Customer",
	},
	dateOrdered: {
		type: Date,
		default: Date.now,
	},
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
