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
		});
	} else {
		res.status(200).render("report", { username: req.session.username, msg: ""  });

		// res.status(200).render('secrets',{name:req.session.username});
	}
});

app.get("/login", (req, res) => {
	res.status(200).render("login", {
		error: "",
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
			console.log("authenticated")
			req.session.authenticated = true; // 'authenticated': true
			req.session.username = req.body.username; // 'username': req.body.name
			req.session.type = user.type;
			avatarMap.set(req.body.username, user.avatar == "" ? "/default.webp" : user.avatar);
			console.log(req.session.type);
			req.session.search_data = null;
			console.log(req.session)
		}
	});
	if (req.session.authenticated) {
		res.status(200).render("report", { username: req.session.username, msg: ""  });
	} else {
		res.status(401).render("login", {
			error: "Invalid username or password",
		});
	}
});

app.get("/logout", (req, res) => {
	req.session = null; // clear cookie-session
	try { avatarMap.delete(req.session.username); } catch (e) {}// drop avatar 
	res.redirect("/login");
});

app.get("/avatar", (req, res) => {
	res.send(avatarMap.get(req.session.username));
});

app.post("/sandwich", (req, res) => {
	console.log(req.session.type);
	if (req.session.type == "admin") {
		console.log("[xkcd] make me a sandwich")
		// try to find the username in the database that matches the username in the request, if yes then update the type to admin
		User.findOneAndUpdate(
			{ username: req.body.username },
			{ type: "admin" },
			(err, doc) => {
				if (err) {
					res.status(500).end("[ERROR] " + err);
				}
				console.log(doc)
				res.status(200).end("OKAY");
			}
		);
	} else {
		res.status(401).end(req.session.username + " is not in the admin group. This incident will NOT be reported");
	}
});

app.get("/list", (req, res) => {
	if (req.session.authenticated) {
		let display = ""
		if (req.session.search_data != null && req.session.search_data != "") {
			console.log("Constracting content for display......")
			for (var i = riders.length - 1; i >= 0; i--) {
				display += "<tr><td>"+riders[i].name +"</td>"
				console.log(riders[i].name)
				for (var j = riders[i].reports.length - 1; i >= 0; i--) {
					display += "<td>" + riders[i].reports[j].username + "</td>" +
					"<td>" + riders[i].reports[j].courseCode + "</td>" +
					"<td>" + riders[i].reports[j].remarks + "</td>" +
					"<td>" + riders[i].reports[j].reportDate + "</td>";
					console.log(riders[i].reports[j].username)
					console.log(riders[i].reports[j].courseCode)
					console.log(riders[i].reports[j].remarks)
					console.log(riders[i].reports[j].reportDate)
				}
				display += "</tr>";
			}	
		console.log(req.session)
		console.log("Display:", display)
		console.log("Session data", req.session.search_data)
		res.status(200).render("list", {riders: display});
		req.session.search_data = null;
		}else{
			res.status(200).render("list");
		}
	} else {
		res.status(401).render("login", {
			error: "user not authenticated",
		});
	}
});

app.post("/list", (req, res) => {
	if (req.session.authenticated) {
		res.status(200).render("list", {riders: ""});
	} else {
		res.status(401).render("login", {
			error: "user not authenticated",
		});
	}
});

app.get("/report", (req, res) => {
	console.log(req.session.authenticated)
	if (req.session.authenticated) {
		res.status(200).render("report", { username: req.session.username, msg: ""  });
	} else {
		console.log("here")
		res.status(401).render("login", {
			error: "user not authenticated",
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
				res.status(200).render("report", { username: req.session.username, msg: "Reported successfully"});
			} catch (error) {
				console.log(error);
				res.status(500).render("report", { username: req.session.username, msg: "Error: " + error});
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
				res.status(500).render("register", {
					msg: "Error: Duplicate username or sid, if you registered before please login",
				});
			} else {
				res.status(500).render("register", { msg: "Error: " + err });
			}
		} else {
			console.log(result.username + " saved to users collection.");
			users = await User.find({}); // update users list
			res.status(200).render("register", {
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
	console.log("Finding...Name: "+ name +" Coursecode: "+ course);
	let Rider = mongoose.model("Rider", riderSchema);

	if (name != "" && course != "NA"){
		Rider.find({ name: name, reports: { courseCode: course } }, function(err, results){
			if (err) return console.error(err);
			console.log(results);
			return req.session.search_data = results;
		});
	}else if (name == "" && course == "NA"){
		Rider.find({}, function(err, results){
			if (err) return console.error(err);
			console.log(results);
			return req.session.search_data = results;
		});
	}
	else if (name == "" && course != "NA"){
		Rider.find( {reports: { courseCode: course } }, function(err, results){
			if (err) return console.error(err);
			console.log(results);
			return req.session.search_data = results;
		});
	}else if (name != "" && course == "NA"){
		Rider.find({name: name}, function(err, results){
			if (err) return console.error(err);
			console.log(results);
			return req.session.search_data = results;
		});
	}

	console.log("Free Riders found: ", riders);
	res.redirect("list");

	});

// Direct to the drop.ejs by GET
app.get("/drop", (req, res) => {
	if (req.session.authenticated) {
		res.status(200).render("drop");
	} else {
		res.status(401).render("login", {
			error: "user not authenticated",
		});
	}
});

//Dropping someone
app.post("/drop", (req, res) => {
	if (req.session.type == 'admin'){
		var anSID = req.body.sid;
		var aCourseCode = req.body.coursecode;

		const idArray = []; 
		let aRider = mongoose.model("Rider", riderSchema);
		aRider.findOne(
			{ sid: {$eq:anSID} },
			function (err, aRider) {
				if (err) {
					console.log("ERROR 1!");
				} else {
					for (let i = 0; i < aRider.reports.length; i++) {
						if (aRider.reports.length == 0 || aRider.reports[i].courseCode == "") {
							console.log(anSID, " is no longer a Rider");
							break;
						} else {
							if (aRider.reports[i].courseCode != "" || aRider.reports[i].courseCode == aCourseCode) {
								console.log(anSID, " is a Rider");
								idArray.push(aRider.reports[i]._id);
								console.log("Pushed ", aRider.reports[i]._id, " into idArray");
							}
						}
					}
					console.log("idArray = ", idArray);
				}
			} 
		);

		console.log("Okay next step is to remove: ");
		for (let ii = 0; ii < idArray.length; ii++) {
			aRider.findByIdAndDelete(idArray[ii], function (err, aRider) {
				if (err) {
					console.log("ERROR 2!");
				} else {
					console.log(anSID, " is no longer a rider in ", aCourseCode);
				}
			});
		}

		res.status(200).render("report", {
			username: req.session.username, msg: "",
		});
	} else {
		res.status(401).render("report", {
			username: req.session.username, msg: "user not authenticated",
		});
	}
});

process.env.PORT = process.env.PORT || 8099;
app.listen(app.listen(process.env.PORT));
console.log(`Server running at http://localhost:${process.env.PORT}/`);