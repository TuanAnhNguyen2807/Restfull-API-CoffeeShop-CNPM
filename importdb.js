const raw = require('./data.json')
const mongoose = require('mongoose')
const data = raw.data
const categoryModel = require('./models/category')
const productModel = require('./models/product')

mongoose
	.connect("mongodb+srv://user:user@learningmongo1.89tk5.gcp.mongodb.net/coffeeShopDB?retryWrites=true")
	.then(() => {
		console.log("Database Connection is ready...");
        data.forEach(category => {
            categoryModel
                .create({name: category.name})
                .then(resp=>{
                    category.dishes.forEach(dish=>{
                        productModel.create({
                            name: dish.name,
                            description: dish.description,
                            images: dish.images,
                            price: dish.price,
                            category: resp._id
                        })
                            .then(res=>console.log("Created " + res.name))
                            .catch(e=>console.error(e))
                    })
                })
                .catch(e=>console.error(e))
        })
	})
	.catch((err) => {
		console.log(err);
	});

