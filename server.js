const express = require("express");
const session = require("cookie-session");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
mongoose.connect(
	"mongodb://mongo:osWLKX0WcgMxoRdO3bjU@containers-us-west-81.railway.app:7018"
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connection to db established"));

const riderSchema = require("./models/rider");

const app = express();

const SECRETKEY = "I want to pass COMPS381F" || process.env.SECRETKEY;

// TODO: Replace it with MongoDB documents later
const users = new Array(
	{ username: "Eric", password: "123" },
	{ username: "Stan", password: "123" },
	{ username: "Kyle", password: "123" }
);

app.use(
	session({
		name: "loginSession",
		keys: [SECRETKEY],
	})
);

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.get("/", (req, res) => {
	console.log(req.session);
	if (!req.session.authenticated) {
		// user not logged in!
		res.redirect("/login");
	} else {
		res.status(200).render("index", { username: req.session.username });
		// res.status(200).render('secrets',{name:req.session.username});
	}
});

app.get("/login", (req, res) => {
	res.status(200).render("login", {});
});

app.post("/login", (req, res) => {
	console.log(req.body);
	users.forEach((user) => {
		console.log(user);
		if (
			user.username == req.body.username &&
			user.password == req.body.password
		) {
			// correct user name + password
			// store the following name/value pairs in cookie session
			req.session.authenticated = true; // 'authenticated': true
			req.session.username = req.body.username; // 'username': req.body.name
		}
	});
	res.redirect("/");
});

app.get("/logout", (req, res) => {
	req.session = null; // clear cookie-session
	res.redirect("/");
});

app.get("/leaderboard", (req, res) => {
	if (!req.session.authenticated) {
		res.redirect("/login");
	}
});

app.post("/report", (req, res) => {
	// report a rider Kenny
	// add rider to database if not exist
	// add reporter to rider's reports array
	let Rider = mongoose.model("Rider", riderSchema);
	Rider.findOneAndUpdate(
		{ sid: req.body.sid },
		{
			$push: {
				reports: {
					username: req.session.username,
					remarks: req.body.remarks || "",
				},
			},
		},
		{},
		async (error, result) => {
			if (error) return;
			// do something with the document
			if (!result) {
				console.log("Entry not found, try to create one");
				result = new Rider({
					sid: req.body.sid,
					reports: [
						{
							username: req.session.username,
							remarks: req.body.remarks || "",
						},
					],
				});
			} else {
				console.log("Entry found, update it");
			}
			try {
				let reply = await result.save((err, result) => {
					if (err) return console.error(err);
					console.log(result.sid + " saved to rider collection.");
				});
				res.status(200).json({
					log: reply,
					message: "Reported successfully",
				});
			} catch (error) {
				console.log(error);
				res.status(500).end("Error: " + error);
			}
		}
	);
});

process.env.PORT = process.env.PORT || 8099;
app.listen(app.listen(process.env.PORT));
console.log(`Server running at http://localhost:${process.env.PORT}/`);
