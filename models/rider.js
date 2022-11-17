var mongoose = require("mongoose");

var riderSchema = new mongoose.Schema({
	sid: { type: String, unique: true, required: true, min: 8, max: 8 },
	year: { type: Number, max: 1 },
	name: { type: String },
	reports: [
		{
			username: String,
			reportDate: { type: Date, default: Date.now },
			remarks: { type: String, default: "" },
		},
	],
});

module.exports = riderSchema;
