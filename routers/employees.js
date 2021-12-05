const express = require("express");
const router = express.Router();
const Employee = require("../models/employee");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

router
	.route("/")
	.get(function (req, res) {
		Employee.find(function (err, foundEmployeeList) {
			if (!err) {
				if (foundEmployeeList.length === 0) {
					return res.status(200).json({
						message: "Empty Employee",
					});
				}
				return res.send(foundEmployeeList);
			} else {
				return res.status(500).json({
					success: false,
					error: err,
				});
			}
		});
	})
	.post(function (req, res) {
		let salt = parseInt(process.env.SALT_ROUND);
		let hashPassWord = bcrypt.hashSync(req.body.password, salt);
		let newEmployee = new Employee({
			name: req.body.name,
			email: req.body.email,
			password: hashPassWord,
			phone: req.body.phone,
			address: req.body.address,
			salary: req.body.salary,
		});
		newEmployee.save(function (err) {
			if (!err) {
				return res
					.status(200)
					.send("Successfully added a new Employee.");
			} else {
				return res.status(400).json({
					success: false,
					error: err.message,
					status: "A Employee cannot be created",
				});
			}
		});
	});
router
	.route("/:employeeId")
	.get(function (req, res) {
		Employee.findOne(
			{ _id: req.params.employeeId },
			function (err, foundEmployee) {
				if (foundEmployee) {
					return res.send(foundEmployee);
				}
				return res.status(404).json({
					success: false,
					message: "A Employee with the given ID was not found",
				});
			}
		);
	})
	.put(async function (req, res) {
		const employeefound = await Employee.findById(req.params.employeeId);
		if (!employeefound) {
			return res.status(404).json({
				success: false,
				message: "Employee ID does not exist!",
			});
		}
		Employee.findOneAndUpdate(
			{ _id: req.params.employeeId },
			{
				name: req.body.name,
				email: req.body.email,
				password: req.body.password
					? bcrypt.hashSync(
							req.body.password,
							parseInt(process.env.SALT_ROUND)
					  )
					: employeefound.password,
				phone: req.body.phone,
				address: req.body.address,
				salary: req.body.salary,
			},
			{ new: true },
			function (err) {
				if (!err) {
					res.status(200).send(
						"Successfully updated the selected Employee."
					);
				} else {
					res.status(404).json({
						success: false,
						error: err.message,
						status: "A Employee cannot updated",
					});
				}
			}
		);
	})
	.delete(function (req, res) {
		Employee.findOneAndDelete(
			{ _id: req.params.employeeId },
			function (err, foundEmployee) {
				if (!err) {
					if (!foundEmployee) {
						return res.status(404).json({
							message: "Employee does not exist.",
						});
					}
					return res.status(200).json({
						success: true,
						message: "Successfully deleted a select Employee",
					});
				} else {
					return res.status(404).json({
						sucess: false,
						error: err.message,
						message: "Invalid Employee ID",
						status: "A Employee cannot deleted.",
					});
				}
			}
		);
	});

router.post("/login", function (req, res) {
	Employee.findOne({ email: req.body.email }, function (err, foundEmployee) {
		if (foundEmployee) {
			if (bcrypt.compareSync(req.body.password, foundEmployee.password)) {
				const secret = process.env.SECRET;
				const token = jwt.sign(
					{
						employeeId: foundEmployee._id,
						isEmployee: true,
					},
					secret,
					{
						expiresIn: "1d",
					}
				);
				return res.status(200).json({
					email_employee: foundEmployee.email,
					token: token,
				});
			} else {
				return res.status(400).json({ message: "Password is wrong!" });
			}
		}
		return res.status(400).json({ message: "Email Employee not found" });
	});
});

router.post("/register", function (req, res) {
	let salt = parseInt(process.env.SALT_ROUND);
	let hashPassWord = bcrypt.hashSync(req.body.password, salt);
	let newEmployee = new Employee({
		name: req.body.name,
		email: req.body.email,
		password: hashPassWord,
		phone: req.body.phone,
		address: req.body.address,
		salary: req.body.salary,
	});
	newEmployee.save(function (err) {
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
	Employee.countDocuments(function (err, count) {
		if (!err) {
			res.status(200).json({ employeeCount: count });
		} else {
			res.send(err);
		}
	});
});

module.exports = router;
