var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
	sid: { type: String, unique: true, required: true, min: 8, max: 8 },
	username: { type: String, unique: true, required: true },
	password: { type: String, required: true, min: 8 },
	type: { type: String, default: "user" },
});

module.exports = userSchema;
