var mongoose = require("mongoose");

var riderSchema = new mongoose.Schema({
	sid: { type: String, unique: true, required: true, min: 8, max: 8 },
	reports: [
		{
			username: String,
			reportDate: { type: Date, default: Date.now },
			remarks: { type: String, default: "" },
		},
	],
});

module.exports = riderSchema;
