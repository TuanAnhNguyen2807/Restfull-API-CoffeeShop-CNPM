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
	},
	address: {
		type: String,
	},
	status: {
		type: String,
		require: true,
		default: "Pending",
	},
	totalPrice: {
		type: Number,
		required: true
	},
	customer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Customer",
	},
	employee: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Employee"
	},
	dateOrdered: {
		type: Date,
		default: Date.now,
	},
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
