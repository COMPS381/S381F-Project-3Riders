const mongoose = require("mongoose");

const riderSchema = require("./models/rider");
const userSchema = require("./models/users");

mongoose.connect(
	"mongodb://mongo:osWLKX0WcgMxoRdO3bjU@containers-us-west-81.railway.app:7018"
);

var User = mongoose.model("Users", userSchema);
let Rider = mongoose.model("Rider", riderSchema);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.on("error", (error) => console.log(error));
db.once("open", async () => {
	console.log("connection to db established");
	// get users from mongoose instance
	User.collection.drop().then(Rider.collection.drop().then(() => {
		console.log("db collections dropped"); 
		db.close();
		process.exit(0);
	}));
});