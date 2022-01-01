const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const employeeSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		default: "",
	},
	salary: {
		type: Number,
		default: 0,
	},
	role: {
		type: String,
		enum: ["admin", "manager", "employee"],
		default: "employee"
	}
});
employeeSchema.plugin(uniqueValidator);
const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
