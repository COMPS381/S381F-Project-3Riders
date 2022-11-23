const express = require("express");
const session = require("cookie-session");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const riderSchema = require("./models/rider");
const userSchema = require("./models/users");

mongoose.connect(
	"mongodb://mongo:osWLKX0WcgMxoRdO3bjU@containers-us-west-81.railway.app:7018"
);

var users = undefined;
var User = mongoose.model("Users", userSchema);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.on("error", (error) => console.log(error));
db.once("open", async () => {
	console.log("connection to db established");
	// get users from mongoose instance
	users = await User.find({}).then(console.log("user accounts loaded"));
	// console.log(users);
});

const app = express();

const SECRETKEY = "I want to pass COMPS381F" || process.env.SECRETKEY;

var searchMap = new Map();
let Rider = mongoose.model("Rider", riderSchema);
let docList = [];
var leaderboard = Rider.aggregate(
	[{ $unwind: "$reports" }, { $sort: { reportDate: -1 } }, { $limit: 5 }],
	function (err, results) {
		if (err) return console.error(err);
		console.log(results);
		try {
			results.forEach((doc) => docList.push(doc));
		} catch (e) {
			console.log(e);
		}
		searchMap.set("leader", JSON.stringify(docList));
		console.log(searchMap);
	}
);
console.log(leaderboard);
console.log(searchMap);

app.use(
	session({
		name: "loginSession",
		keys: [SECRETKEY],
	})
);

app.set("view engine", "ejs");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static("public"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.get("/", (req, res) => {
	console.log(req.session);
	if (!req.session.authenticated) {
		// user not logged in!
		res.status(401).render("login", {
			error: "user not authenticated",
			leader: searchMap.get("leader"),
		});
	} else {
		res.status(200).render("report", {
			username: req.session.username,
			msg: "",
		});

		// res.status(200).render('secrets',{name:req.session.username});
	}
});

app.get("/login", (req, res) => {
	res.status(200).render("login", {
		error: "",
		leader: searchMap.get("leader"),
	});
});

var avatarMap = new Map();
app.post("/login", (req, res) => {
	// console.log(req.body);
	users.forEach((user) => {
		// console.log(user);
		if (
			user.username == req.body.username &&
			user.password == req.body.password
		) {
			// correct user name + password
			// store the following name/value pairs in cookie session
			console.log("authenticated");
			req.session.authenticated = true; // 'authenticated': true
			req.session.username = req.body.username; // 'username': req.body.name
			req.session.type = user.type;
			avatarMap.set(
				req.body.username,
				user.avatar == "" ? "/default.webp" : user.avatar
			);
			console.log(req.session.type);
			// req.session.search_data = null;
			console.log(req.session);
		}
	});
	if (req.session.authenticated) {
		req.headers["user-agent"].indexOf("curl") >= 0
			? res.status(200).json({
					msg: "Login successfully",
			  })
			: res.status(200).render("report", {
					username: req.session.username,
					msg: "",
			  });
	} else {
		req.headers["user-agent"].indexOf("curl") >= 0
			? res.status(401).json({
					error: "Invalid username or password",
			  })
			: res.status(401).render("login", {
					error: "Invalid username or password",
					leader: searchMap.get("leader"),
			  });
	}
});

app.get("/logout", (req, res) => {
	req.session = null; // clear cookie-session
	try {
		avatarMap.delete(req.session.username);
	} catch (e) {} // drop avatar
	res.redirect("/login");
});

app.get("/avatar", (req, res) => {
	res.send(avatarMap.get(req.session.username));
});

app.get("/sandwich", (req, res) => {
	if (req.session.type == "admin") {
		res.status(200).render("sandwich", { msg: "" });
	} else {
		res.status(401).render("sandwich", {
			msg: "user not authenticated as admin, please login as admin",
		});
	}
});

app.post("/sandwich", (req, res) => {
	console.log(req.session.type);
	if (req.session.type == "admin") {
		console.log("make me a sandwich");
		// try to find the username in the database that matches the username in the request, if yes then update the type to admin
		User.findOneAndUpdate(
			{ username: req.body.username },
			{ type: req.body.type ? "admin" : "user" },
			async (err, doc) => {
				if (err) {
					req.headers["user-agent"].indexOf("curl") >= 0
						? res.status(500).json({
								msg: "[ERROR] " + err,
						  })
						: res
								.status(500)
								.render("sandwich", { msg: "[ERROR] " + err });
				}
				console.log(doc);
				users = await User.find({}); // update users list
				req.headers["user-agent"].indexOf("curl") >= 0
					? res.status(200).json({
							msg: "OKAY",
					  })
					: res.status(200).redirect("/sandwich");
			}
		);
	} else {
		res.status(401).end(
			req.session.username +
				" is not in the admin group. This incident will NOT be reported"
		);
	}
});

app.get("/list", (req, res) => {
	if (req.session.authenticated) {
		console.log("Free Riders found: ", searchMap.get(req.body.username)); // req.session.search_data);
		res.status(200).render("list", {
			riders: searchMap.get(req.body.username),
		});
	} else {
		res.status(401).render("login", {
			error: "user not authenticated",
			leader: searchMap.get("leader"),
		});
	}
});

app.get("/report", (req, res) => {
	console.log(req.session.authenticated);
	if (req.session.authenticated) {
		res.status(200).render("report", {
			username: req.session.username,
			msg: "",
		});
	} else {
		console.log("here");
		res.status(401).render("login", {
			error: "user not authenticated",
			leader: searchMap.get("leader"),
		});
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
					courseCode: req.body.coursecode,
					remarks: req.body.remarks || "",
				},
			},
		},
		async (error, result) => {
			if (error) return;
			// do something with the document
			if (!result) {
				console.log("Entry not found, try to create one");
				result = new Rider({
					sid: req.body.sid,
					name: req.body.name,
					reports: [
						{
							username: req.session.username,
							courseCode: req.body.coursecode,
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
				// res.status(200).json({
				// 	log: reply,
				// 	message: "Reported successfully",
				// });
				req.headers["user-agent"].indexOf("curl") >= 0
					? res.status(200).json({
							msg: "Reported successfully",
					  })
					: res.status(200).render("report", {
							username: req.session.username,
							msg: "Reported successfully",
					  });
			} catch (error) {
				console.log(error);
				req.headers["user-agent"].indexOf("curl") >= 0
					? res.status(500).json({
							msg: "Error: " + error,
					  })
					: res.status(500).render("report", {
							username: req.session.username,
							msg: "Error: " + error,
					  });
			}
		}
	);
	// res.status(200).render("report", { username: req.session.username, msg: "Reported successfully"});
});

app.get("/register", (req, res) => {
	res.status(200).render("register", { msg: "" });
});

app.post("/register", (req, res) => {
	// register a new user, if duplicate entry, return error msg, else return success msg
	let NewUser = mongoose.model("User", userSchema);
	// let type = req.body.admin ? "admin" : "user";
	let newUser = new NewUser({
		username: req.body.username,
		password: req.body.password,
		sid: req.body.sid,
		avatar: req.body.avatar,
		type: "user",
	});
	newUser.save(async (err, result) => {
		if (err) {
			console.log(err);
			// check if err is duplicate entry
			if (err.code == 11000) {
				req.headers["user-agent"].indexOf("curl") >= 0
					? res.status(500).json({
							msg: "Error: Duplicate username or sid, if you registered before please login",
					  })
					: res.status(500).render("register", {
							msg: "Error: Duplicate username or sid, if you registered before please login",
					  });
			} else {
				req.headers["user-agent"].indexOf("curl") >= 0
					? res.status(500).json({ msg: "Error: " + err })
					: res
							.status(500)
							.render("register", { msg: "Error: " + err });
			}
		} else {
			console.log(result.username + " saved to users collection.");
			users = await User.find({}); // update users list
			req.headers["user-agent"].indexOf("curl") >= 0
				? res.status(200).json({
						msg: "Registered successfully",
				  })
				: res.status(200).render("register", {
						msg: "Registered successfully",
				  });
		}
	});
});

app.get("/search", (req, res) => {
	res.redirect("list");
});

//search for free rider and list out on list.ejs
app.post("/search", (req, res) => {
	let name = req.body.search_name;
	let course = req.body.search_course;
	console.log("Finding...Name: " + name + " Coursecode: " + course);
	let Rider = mongoose.model("Rider", riderSchema);
	let docList = [];

	if (name != "" && course != "NA") {
		Rider.find(
			{ name: name, reports: { courseCode: course } },
			{ _id: 0 },
			function (err, results) {
				if (err) return console.error(err);
				results.forEach((doc) => docList.push(doc));
				searchMap.set(req.body.username, JSON.stringify(docList));
				req.headers["user-agent"].indexOf("curl") >= 0
					? res.status(200).json(docList)
					: res.redirect("list");
			}
		);
	} else if (name == "" && course == "NA") {
		Rider.find({}, { _id: 0 }, function (err, results) {
			if (err) return console.error(err);
			results.forEach((doc) => docList.push(doc));
			searchMap.set(req.body.username, JSON.stringify(docList));
			req.headers["user-agent"].indexOf("curl") >= 0
				? res.status(200).json(docList)
				: res.redirect("list");
		});
	} else if (name == "" && course != "NA") {
		Rider.find(
			{ reports: { courseCode: course } },
			{ _id: 0 },
			function (err, results) {
				if (err) return console.error(err);
				results.forEach((doc) => docList.push(doc));
				searchMap.set(req.body.username, JSON.stringify(docList));
				req.headers["user-agent"].indexOf("curl") >= 0
					? res.status(200).json(docList)
					: res.redirect("list");
			}
		);
	} else if (name != "" && course == "NA") {
		Rider.find({ name: name }, { _id: 0 }, function (err, results) {
			if (err) return console.error(err);
			results.forEach((doc) => docList.push(doc));
			searchMap.set(req.body.username, JSON.stringify(docList));
			req.headers["user-agent"].indexOf("curl") >= 0
				? res.status(200).json(docList)
				: res.redirect("list");
		});
	}
});

// Direct to the drop.ejs by GET
app.get("/drop", (req, res) => {
	if (req.session.authenticated) {
		res.status(200).render("drop");
	} else {
		res.status(401).render("login", {
			error: "user not authenticated",
			leader: searchMap.get("leader"),
		});
	}
});

//Dropping someone
app.post("/drop", (req, res) => {
	if (req.session.type == "admin") {
		console.log("Request Body = ", req.body);
		var nameStr = req.body.nameStr;
		var dropID = req.body.report_id;

		let aRider = mongoose.model("Rider", riderSchema);
		aRider.updateMany(
			{ },
			{
				$pull: {
					reports: {
						_id: dropID
					},
				},
			},
			function(err, result) {
				console.log("Result: ", result);
			}
		);
		console.log("Done!");

		/* Failed One
		let aRider = mongoose.model("Rider", riderSchema);
		aRider.aggregate([	
			{$unwind: '$reports'},
			{$sort: {'_id': dropID}}
		], function(err, results) {
			if (err) return console.error(err);
			console.log("Results: ", results);
		})
		*/

		/* Successful One
		db.riders.updateMany({ name: "Xavier_2" }, { $pull: { reports: { remarks: { $eq: "Testing Only" } } } } );
		*/

		req.headers["user-agent"].indexOf("curl") >= 0
			? res.status(200).json({ msg: "Report has been dropped" })
			: res.status(200).render("report", {
					username: req.session.username,
					msg: "Report has been dropped",
			  });
	} else {
		req.headers["user-agent"].indexOf("curl") >= 0
			? res.status(401).json({ msg: "user not authenticated" })
			: res.status(401).render("report", {
					username: req.session.username,
					msg: "user not authenticated",
			  });
	}
});

process.env.PORT = process.env.PORT || 8099;
app.listen(app.listen(process.env.PORT));
console.log(`Server running at http://localhost:${process.env.PORT}/`);
