const express = require("express");
const router = express.Router();
const Customer = require("../models/customer");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

router
	.route("/")
	.get(function (req, res) {
		Customer.find(function (err, foundCustomerList) {
			if (!err) {
				if (foundCustomerList.length === 0) {
					return res.status(200).json({
						message: "Empty Customer",
					});
				}
				return res.send(foundCustomerList);
			} else {
				return res.status(500).json({
					success: false,
					error: err,
				});
			}
		}).select("-password");
	})
	.post(function (req, res) {
		let salt = parseInt(process.env.SALT_ROUND);
		let hashPassWord = bcrypt.hashSync(req.body.password, salt);
		let newCustomer = new Customer({
			name: req.body.name,
			email: req.body.email,
			password: hashPassWord,
			phone: req.body.phone,
			address: req.body.address,
		});
		newCustomer.save(function (err) {
			if (!err) {
				return res
					.status(200)
					.send("Successfully added a new Customer.");
			} else {
				return res.status(400).json({
					success: false,
					error: err.message,
					status: "A Customer cannot be created",
				});
			}
		});
	});

router
	.route("/:customerId")
	.get(function (req, res) {
		Customer.findOne(
			{ _id: req.params.customerId },
			function (err, foundCustomer) {
				if (foundCustomer) {
					return res.send(foundCustomer);
				}
				return res.status(404).json({
					success: false,
					message: "A Customer with the given ID was not found",
				});
			}
		).select("-password");
	})
	.put(async function (req, res) {
		const customerfound = await Customer.findById(req.params.id);
		Customer.findOneAndUpdate(
			{ _id: req.params.customerId },
			{
				name: req.body.name,
				email: req.body.email,
				password: req.body.password
					? bcrypt.hashSync(
							req.body.password,
							parseInt(process.env.SALT_ROUND)
					  )
					: customerfound.password,
				phone: req.body.phone,
				address: req.body.address,
			},
			{ new: true },
			function (err) {
				if (!err) {
					res.status(200).send(
						"Successfully updated the selected Customer."
					);
				} else {
					res.status(404).json({
						success: false,
						error: err.message,
						status: "A Customer cannot updated",
					});
				}
			}
		);
	})
	.delete(function (req, res) {
		Customer.findOneAndDelete(
			{ _id: req.params.customerId },
			function (err, foundEmployee) {
				if (!err) {
					if (!foundEmployee) {
						return res.status(404).json({
							message: "Customer does not exist.",
						});
					}
					return res.status(200).json({
						success: true,
						message: "Successfully deleted a select Customer",
					});
				} else {
					return res.status(404).json({
						sucess: false,
						error: err.message,
						message: "Invalid Customer ID",
						status: "A Customer cannot deleted.",
					});
				}
			}
		);
	});

router.post("/login", function (req, res) {
	Customer.findOne({ email: req.body.email }, function (err, foundCustomer) {
		if (foundCustomer) {
			if (bcrypt.compareSync(req.body.password, foundCustomer.password)) {
				const secret = process.env.SECRET;
				const token = jwt.sign(
					{
						customerId: foundCustomer._id,
						isCustomer: true,
					},
					secret,
					{
						expiresIn: "1w",
					}
				);
				return res.status(200).json({
					user: foundCustomer.email,
					token: token,
				});
			} else {
				return res.status(400).json({ message: "Password is wrong!" });
			}
		}
		return res.status(400).json({ message: "Email user not found" });
	});
});

router.post("/register", function (req, res) {
	let salt = parseInt(process.env.SALT_ROUND);
	let hashPassWord = bcrypt.hashSync(req.body.password, salt);
	let newCustomer = new Customer({
		name: req.body.name,
		email: req.body.email,
		password: hashPassWord,
		phone: req.body.phone,
		address: req.body.address,
	});
	newCustomer.save(function (err) {
		if (!err) {
			return res.status(200).send("Successful registration.");
		} else {
			return res.status(400).json({
				success: false,
				error: err.message,
				status: "Registration failed.",
			});
		}
	});
});
router.get("/get/count", function (req, res) {
	Customer.countDocuments(function (err, count) {
		if (!err) {
			res.status(200).json({ customerCount: count });
		} else {
			res.send(err);
		}
	});
});

module.exports = router;
