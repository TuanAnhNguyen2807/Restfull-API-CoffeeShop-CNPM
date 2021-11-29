const express = require("express");
const Product = require("../models/product");
const Category = require("../models/category");
const router = express.Router();

router
	.route("/")
	.get(function (req, res) {
		let filter_category = {};
		let query_categories = req.query.categories;
		if (req.query.categories) {
			filter_category = { category: query_categories.split(",") };
		}
		Product.find(filter_category, function (err, foundProductList) {
			if (!err) {
				if (foundProductList.length === 0) {
					return res.status(200).json({
						message: "Empty Product",
					});
				}
				return res.send(foundProductList);
			} else {
				return res.status(500).json({
					success: false,
					error: err,
				});
			}
		}).populate("category");
	})
	.post(function (req, res) {
		Category.findOne(
			{ _id: req.body.category },
			function (err, foundCategory) {
				if (foundCategory) {
					const newProduct = new Product({
						name: req.body.name,
						description: req.body.description,
						image: req.body.image,
						images: req.body.images,
						price: req.body.price,
						category: req.body.category,
						rating: req.body.rating,
						isFeatured: req.body.isFeatured,
						dateCreated: req.body.dateCreated,
					});
					newProduct.save(function (err) {
						if (!err) {
							return res
								.status(200)
								.send("Successfully added a new Product.");
						} else {
							return res.status(400).json({
								success: false,
								error: err.message,
								status: "The Product cannot be created",
							});
						}
					});
				} else {
					return res
						.status(404)
						.json({ message: "Invalid Category ID" });
				}
			}
		);
	})
	.delete(function (req, res) {
		Product.deleteMany(function (err) {
			if (!err) {
				return res
					.status(200)
					.send("Successfully deleted all products.");
			} else {
				return res.status(500).json({
					success: false,
					error: err.message,
				});
			}
		});
	});

router
	.route("/:productId")
	.get(function (req, res) {
		Product.findOne(
			{ _id: req.params.productId },
			function (err, foundProduct) {
				if (foundProduct) {
					return res.send(foundProduct);
				}
				return res.status(404).json({
					success: false,
					message: "The Product with the given ID was not found",
				});
			}
		).populate("category");
	})
	.put(function (req, res) {
		Product.findOneAndUpdate(
			{ _id: req.params.productId },
			{
				name: req.body.name,
				description: req.body.description,
				image: req.body.image,
				images: req.body.images,
				price: req.body.price,
				category: req.body.category,
				rating: req.body.rating,
				isFeatured: req.body.isFeatured,
				dateCreated: req.body.dateCreated,
			},
			{ new: true },
			function (err) {
				if (!err) {
					res.status(200).send(
						"Successfully updated the selected Product."
					);
				} else {
					res.status(404).json({
						success: false,
						error: err.message,
						status: "The Product cannot updated",
					});
				}
			}
		);
	})
	.delete(function (req, res) {
		Product.findOneAndDelete(
			{ _id: req.params.productId },
			function (err, foundCategory) {
				if (!err) {
					if (!foundCategory) {
						return res.status(404).json({
							message: "Product does not exist.",
						});
					}
					return res.status(200).json({
						success: true,
						message: "Successfully deleted the Product",
					});
				} else {
					return res.status(404).json({
						sucess: false,
						error: err.message,
						message: "Invalid Product ID",
						status: "The Product cannot deleted.",
					});
				}
			}
		);
	});

router.get("/get/count", function (req, res) {
	Product.countDocuments(function (err, count) {
		if (!err) {
			res.status(200).json({ productCount: count });
		} else {
			res.send(err);
		}
	});
});

router.get("/get/featured/:count", function (req, res) {
	const count = req.params.count ? req.params.count : 0;
	Product.find({ isFeatured: true }, function (err, foundProducts) {
		if (!err) {
			if (foundProducts.length === 0) {
				return res.status(200).json({
					message: "No Featured Products",
				});
			}
			res.status(200).send(foundProducts);
		} else {
			return res.status(500).json({
				success: false,
				error: err,
			});
		}
	})
		.limit(parseInt(count))
		.populate("category");
});

module.exports = router;
