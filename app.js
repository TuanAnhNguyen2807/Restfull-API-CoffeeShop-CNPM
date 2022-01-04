require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const productsRouter = require("./routers/products");
const categoryRouter = require("./routers/categories");
const customerRouter = require("./routers/customers");
const employeeRouter = require("./routers/employees");
const orderRouter = require("./routers/orders");
const storageRouter = require("./routers/storage");
const authJwt = require("./helpers/jwt");
const errorHandle = require("./helpers/error-handle");

const api = process.env.API_URL;
const app = express();

// Middleware
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandle);

mongoose
	.connect("mongodb+srv://user:user@learningmongo1.89tk5.gcp.mongodb.net/coffeeShopDB?retryWrites=true")
	.then(() => {
		console.log("Database Connection is ready...");
	})
	.catch((err) => {
		console.log(err);
	});

// Routers

app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/customers`, customerRouter);
app.use(`${api}/employees`, employeeRouter);
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/storage`, storageRouter);
app.listen(8000, function () {
	console.log("Server is running http://localhost:8000");
});
