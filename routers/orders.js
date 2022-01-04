const express = require("express");
const { error } = require("npmlog");
const router = express.Router();
const Order = require("../models/order");
const OrderItem = require("../models/order-item");
const Product = require("../models/product");
const Customer = require("../models/customer");

router
	.route("/")
	.get(function (req, res) {
		let page = req.query.page ? Number(req.query.page) : 1,
			limit = req.query.limit ? Number(req.query.limit) : 20
		page < 1 || isNaN(page) ? page = 1 : null
		limit < 1 || isNaN(limit) ? limit = 20 : null

		Promise.all([
			Order.find()
				.sort({ role: 1 })
				.select({ __v: false, password: false })
				.limit(limit)
				.skip((page - 1) * limit)
				.populate("customer", "name")
				.populate({
					path: "orderItems",
					populate: {
						path: "product",
						populate: {
							path: "category",
							select: "name"
						},
						select: "_id name price"
					},
					select: "-__v"
				})
				.populate("employee", "name role")
				.sort({ dateOrdered: -1 })
				.select("-__v"),
			Order.count()
		])
			.then(([data, total]) => res.json({
				currentPage: page,
				limit: limit,
				totalPage: total % limit != 0 ? parseInt(total / limit + 1) : total / limit,
				data: data
			}))
			.catch(err => res.status(500).json({
				isSuccess: false,
				error: err,
			}))
	})
	.post(async function (req, res) {
		const orderItemsIds = Promise.all(
			req.body.orderItems.map(async (orderitem) => {
				const foundProduct = Product.findById(orderitem.product);
				if (foundProduct) {
					let newOrderItem = new OrderItem({
						quantity: orderitem.quantity,
						product: orderitem.product,
					});
					newOrderItem = await newOrderItem.save();
					return newOrderItem._id;
				}
			})
		).catch((err) => {
			return -1;
		});
		const orderItemsIdsResolved = await orderItemsIds;
		if (orderItemsIdsResolved === -1) {
			return res.status(404).json({
				error: "Invalid ID Product",
				message: "Cannot create orders",
			});
		}
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
			employee: req.locals.payload.employeeId,
		});
		newOrder.save()
			.then(() => {
				Order.findById(newOrder._id)
					.select({ __v: false, password: false })
					.populate("customer", "name")
					.populate({
						path: "orderItems",
						populate: {
							path: "product",
							populate: {
								path: "category",
								select: "name"
							},
							select: "_id name price"
						},
						select: "-__v"
					})
					.populate("employee", "name role")
					.select("-__v")
					.then(doc => res.json(doc))
			})
			.catch(e => {
				res.status(400).json({
					success: false,
					error: e.message,
					status: "The Order cannot be created",
				});
			})
	});

router.get("/totalsales", async function (req, res) {
	let { startDate, endDate } = req.body
	const totalSales = await Order.aggregate([
		{
			$match: {
				dateOrdered: {
					$gte: new Date(startDate),
					$lte: new Date(endDate)
				}
			}
		},
		{
			$group: {
				_id: null,
				totalsales: {
					$sum: "$totalPrice"
				},
				totalOrders: {
					$sum: 1
				}
			}
		}
	]);
	result = totalSales.pop()
	if (!result) {
		return res.status(400).send("The order sales cannot be generated");
	}
	return res.json({
		startDate: startDate,
		endDate: endDate,
		totalsales: result.totalsales,
		totalOrders: result.totalOrders
	});
});
router.get("/count", function (req, res) {
	Order.countDocuments(function (err, count) {
		if (!err) {
			res.status(200).json({ orderCount: count });
		} else {
			res.send(err);
		}
	});
});
router.get("/customer/:customerId", async function (req, res) {
	const cusOrderList = await Order.find({
		customer: req.params.customerId,
	})
		.populate("customer", "name")
		.populate({
			path: "orderItems",
			populate: {
				path: "product",
				populate: {
					path: "category",
					select: "name"
				},
				select: "_id name price"
			},
			select: "-__v"
		})
		.populate("employee", "name role")
		.select("-__v")
		.sort({ dateOrdered: -1 });
	if (!cusOrderList) {
		return res.status(500).json({ success: false });
	}
	return res.send(cusOrderList);
});

router
	.route("/:orderId")
	.get(function (req, res) {
		Order.findOne({ _id: req.params.orderId }).select("-__v")
			.populate("customer", "name")
			.populate({
				path: "orderItems",
				populate: {
					path: "product",
					populate: {
						path: "category",
						select: "name"
					},
					select: "_id name price"
				},
				select: "-__v"
			})
			.populate("employee", "name role")
			.then(foundOrder => res.send(foundOrder))
			.catch(err => res.status(404).json({
				isSuccess: false,
				message: "The order with the given ID was not found",
			}))
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

module.exports = router;
