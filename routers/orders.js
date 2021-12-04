const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const OrderItem = require("../models/order-item");

router
	.route("/")
	.get(function (req, res) {
		Order.find(function (err, foundOrderList) {
			if (!err) {
				if (foundOrderList.length === 0) {
					return res.status(200).json({
						message: "Empty Orders",
					});
				}
				return res.send(foundOrderList);
			} else {
				return res.status(500).json({
					success: false,
					error: err,
				});
			}
		})
			.populate("customer", "name")
			.populate("orderItems")
			.sort({ dateOrdered: -1 });
	})
	.post(async function (req, res) {
		const orderItemsIds = Promise.all(
			req.body.orderItems.map(async (orderitem) => {
				let newOrderItem = new OrderItem({
					quantity: orderitem.quantity,
					product: orderitem.product,
				});
				newOrderItem = await newOrderItem.save();
				return newOrderItem._id;
			})
		);
		const orderItemsIdsResolved = await orderItemsIds;
		const totalPrices = await Promise.all(
			orderItemsIdsResolved.map(async (orderItemId) => {
				const orderItem = await (
					await OrderItem.findById(orderItemId)
				).populate("product", "price");
				const totalPrice = orderItem.product.price * orderItem.quantity;
				return totalPrice;
			})
		);
		const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
		let newOrder = new Order({
			orderItems: orderItemsIdsResolved,
			shippingAddress: req.body.shippingAddress,
			address: req.body.address,
			status: req.body.status,
			totalPrice: totalPrice,
			customer: req.body.customer,
			dateOrdered: req.body.dateOrdered,
		});
		newOrder.save(function (err) {
			if (!err) {
				return res.status(200).send("Successfully added a new Order.");
			} else {
				return res.status(400).json({
					success: false,
					error: err.message,
					status: "The Order cannot be created",
				});
			}
		});
	});

router
	.route("/:orderId")
	.get(function (req, res) {
		Order.findOne({ _id: req.params.orderId }, function (err, foundOrder) {
			if (foundOrder) {
				return res.send(foundOrder);
			}
			return res.status(404).json({
				success: false,
				message: "The order with the given ID was not found",
			});
		})
			.populate("customer", "name")
			.populate({
				path: "orderItems",
				populate: { path: "product", populate: "category" },
			});
	})
	.put(function (req, res) {
		Order.findOneAndUpdate(
			{ _id: req.params.orderId },
			{
				status: req.body.status,
			},
			{ new: true },
			function (err) {
				if (!err) {
					res.status(200).send("Successfully updated status order.");
				} else {
					res.status(404).json({
						success: false,
						error: err.message,
						message: "Invalid Order ID",
						status: "The status order cannot updated",
					});
				}
			}
		);
	})
	.delete(function (req, res) {
		Order.findByIdAndDelete(req.params.orderId)
			.then(async (order) => {
				if (order) {
					await order.orderItems.map(async (orderItem) => {
						await OrderItem.findByIdAndDelete(orderItem);
					});
					return res.status(200).json({
						success: true,
						message: "Successfully deleted the order",
					});
				} else {
					return res.status(404).json({
						sucess: false,
						error: err.message,
						message: "Invalid Order ID",
						status: "The order cannot deleted.",
					});
				}
			})
			.catch((err) => {
				return res.status(500).json({ success: false, error: err });
			});
	});

router.get("/get/totalsales", async function (req, res) {
	const totalSales = await Order.aggregate([
		{ $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
	]);
	if (!totalSales) {
		return res.status(400).send("The order sales cannot be generated");
	}
	return res.send({ totalsales: totalSales.pop().totalsales });
});
router.get("/get/count", function (req, res) {
	Order.countDocuments(function (err, count) {
		if (!err) {
			res.status(200).json({ orderCount: count });
		} else {
			res.send(err);
		}
	});
});
router.get("/get/customerorders/:customerId", async function (req, res) {
	const cusOrderList = await Order.find({
		user: req.params.customerId,
	})
		.populate({
			path: "orderItems",
			populate: { path: "product", populate: "category" },
		})
		.sort({ dateOrdered: -1 });
	if (!cusOrderList) {
		return res.status(500).json({ success: false });
	}
	return res.send(cusOrderList);
});

module.exports = router;
