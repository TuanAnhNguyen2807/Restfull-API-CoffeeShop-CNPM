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

router.route("/:id").get(function (req, res) {
	Customer.findOne({ _id: req.params.id }, function (err, foundCustomer) {
		if (foundCustomer) {
			return res.send(foundCustomer);
		}
		return res.status(404).json({
			success: false,
			message: "A Customer with the given ID was not found",
		});
	}).select("-password");
});

router.route("/login").post(function (req, res) {
	Customer.findOne({ email: req.body.email }, function (err, foundCustomer) {
		if (foundCustomer) {
			if (bcrypt.compareSync(req.body.password, foundCustomer.password)) {
				let token = jwt.sign(
					{
						customerId: foundCustomer._id,
					},
					process.env.SECRET,
					{
						expiresIn: "1d",
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
module.exports = router;
