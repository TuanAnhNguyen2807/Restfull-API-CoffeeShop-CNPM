const express = require("express");
const Storage = require("../models/storage");
const router = express.Router();
const { isAdmin, isManager, isEmployee } = require("../helpers/role")

router.route("/")
	.get(isManager, async (req, res) => {
		try {
			let storageList = await Storage.find().select("-__v")
			res.json(storageList)
		} catch (error) {
			res.status(400).json({ err: error })
		}
	})
	.post(isManager, async (req, res) => {
		try {
			let item = new Storage({
				name: req.body.name,
				description: req.body.description,
				quantity: req.body.quantity,
				unit: req.body.unit
			})
			await item.save()
			res.json({ msg: "Added item to storage" })
		} catch (error) {
			res.status(400).json({ err: error })
		}
	})

router.route("/:itemid")
	.get(isManager, async (req, res) => {
		try {
			let item = await Storage.findById(req.params.itemid).select("-__v")
			res.json(item)
		} catch (error) {
			res.status(400).json({ err: error })
		}
	})
	.put(isManager, async (req, res) => {
		try {
			await Storage.findOneAndUpdate({ _id: req.params.itemid }, {
				name: req.body.name,
				description: req.body.description,
				quantity: req.body.quantity,
				unit: req.body.unit
			})
			res.json({ msg: "Update item with id " + req.params.itemid })
		} catch (error) {
			res.status(400).json({ err: error })
		}
	})
	.delete(isManager, async (req,res)=>{
		try {
			await Storage.findByIdAndDelete(req.params.itemid)
			res.json({ msg: "Deleted item with id " + req.params.itemid })
		} catch (error) {
			res.status(400).json({ err: error })
		}
	})

module.exports = router;
