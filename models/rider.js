var mongoose = require("mongoose");

var riderSchema = new mongoose.Schema({
	sid: { type: String, unique: true, required: true, min: 8, max: 8 },
	name: { type: String },
	reports: [
		{
			username: String,
			courseCode: { type: String, default: "" },
			reportDate: { type: Date, default: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') },
			remarks: { type: String, default: "" },
		},
	],
});

module.exports = riderSchema;
