const express = require("express");
const Category = require("../models/category");
const router = express.Router();
router
	.route("/")
	.get(function (req, res) {
		Category.find(function (err, foundCategoryList) {
			if (!err) {
				if (foundCategoryList.length === 0) {
					return res.status(200).json({
						message: "Empty Category",
					});
				}
				return res.send(foundCategoryList);
			} else {
				return res.status(500).json({
					success: false,
					error: err,
				});
			}
		});
	})
	.post(function (req, res) {
		let newCategory = new Category({
			name: req.body.name,
		});
		newCategory.save(function (err) {
			if (!err) {
				return res
					.status(200)
					.send("Successfully added a new category.");
			} else {
				return res.status(400).json({
					success: false,
					error: err.message,
					status: "The category cannot be created",
				});
			}
		});
	})
	.delete(function (req, res) {
		Category.deleteMany(function (err) {
			if (!err) {
				return res
					.status(200)
					.send("Successfully deleted all categories.");
			} else {
				return res.status(500).json({
					success: false,
					error: err.message,
				});
			}
		});
	});

router
	.route("/:categoryId")
	.get(function (req, res) {
		Category.findOne(
			{ _id: req.params.categoryId },
			function (err, foundCategory) {
				if (foundCategory) {
					return res.send(foundCategory);
				}
				return res.status(404).json({
					success: false,
					message: "The category with the given ID was not found",
				});
			}
		);
	})
	.put(function (req, res) {
		Category.findOneAndUpdate(
			{ _id: req.params.categoryId },
			{
				name: req.body.name,
			},
			{ new: true },
			function (err) {
				if (!err) {
					res.status(200).send(
						"Successfully updated the selected category."
					);
				} else {
					res.status(404).json({
						success: false,
						error: err.message,
						message: "Invalid Category ID",
						status: "The category cannot updated",
					});
				}
			}
		);
	})
	.delete(function (req, res) {
		Category.findOneAndDelete(
			{ _id: req.params.categoryId },
			function (err, foundCategory) {
				if (!err) {
					if (!foundCategory) {
						return res.status(404).json({
							message: "Category does not exist.",
						});
					}
					return res.status(200).json({
						success: true,
						message: "Successfully deleted the category",
					});
				} else {
					return res.status(404).json({
						sucess: false,
						error: err.message,
						message: "Invalid Category ID",
						status: "The category cannot deleted.",
					});
				}
			}
		);
	});

module.exports = router;
