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
	users = await User.find({});
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
		res.status(200).render("report", { username: req.session.username });
		// res.status(200).render('secrets',{name:req.session.username});
	}
});

app.get("/login", (req, res) => {
	res.status(200).render("login", {
		error: "",
	});
});

var avatar;
app.post("/login", (req, res) => {
	console.log(req.body);
	users.forEach((user) => {
		// console.log(user);
		if (
			user.username == req.body.username &&
			user.password == req.body.password
		) {
			// correct user name + password
			// store the following name/value pairs in cookie session
			req.session.authenticated = true; // 'authenticated': true
			req.session.username = req.body.username; // 'username': req.body.name
			// console.log(avatar);
			avatar =
				user.avatar != ""
					? user.avatar
					: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJIAAAB0CAMAAABZuJsjAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAAMVMAYTLAUVLgIVMAUULgEULwEVMgMVMAIVMQMVMAQULwYULgEWMgIVMQIVMQEVMgQUMAMUMQQUMAcULRcMFxkKEwUTLhEQISsYFRUMFhQMFCEJDBkNFxQOGxsKDyIPDhIPHh8KCxwKDxoKDh0KDhwKDyENDFRNTRsPEQ0TJgsSKScTEiUNDhoNEjcGCi8GEB0MEkUEClEEDiAMDjYwLzAKBxsKDz4HDC8IDVpTUysYFioNCmQGEkAECkkHDS0pKlkDDjEeHNQlQqenp6ampv/PeZcAGEg1MNQkQVY8NDYoJMnJyVY9NZYAGJgAGVQ7ND0sJj0qJrIBHrQCIH5ZTtYlQjsqJrECHpKSklI6M5OTkz8tKP7OeZUAGHxYTUYyLE02L0IvKkkzLUQxK5oBGlE5Mp0AGUY0Lks1L0EuKMjIyNQmQjkpJbIDIM8hPtIjQJkAFdgmQ044MqoBHaEAG6Wlpa4CHqioqP/SesweOzwqIpGRkf2+d7UFIv25dp6enpaXl8caNlg+NnpWS/+9eZMBF9UiQaYBHP7QebsNKTQjIaSkpFxCOpWVlbcJJXRSR9tJSv/CeC8dG//GeZ4FHV4ED4UBFfmzc7y8vHBPRaChodQfQJubm5iYmHYBFHhVSlkGD9QmQKurq7kYMWtMQ6IIIcEbNfaobosBGCkVEWtmZo+Pj48BFnEDE30CEy8hH9QrRLMVLqKjov/JeY+MjGkEEMLCwvGdaa+vr8MWMD0uLdg0RpSNjo+VlZ2Gh7Kysv7LeeFkU8ATLjUnH6oOJ2dgYIqJiHp2dri4uOd8XGJGPq4RKk9EQ6ULJIF7eoBaUb5ZZUoDC+NxV3Nwb95bUWFaWlQHDoWCgmlKQe6OZYl+e/i/dZmSkMJLWWMGENA3Te2UZdY+SJ1tc6FhZc4wRZWcnLiAe8uqh1A/O+iIYqlmbIMQGsxAUa+ajJCGlZRlaJRYW7Skibypiruniciqhc+lg4d3cnxlYdWTcqwfNcGeirqfjdmCZK8tOKRES3hJKO0AAADTdFJOUwANGRUFEQoBAwgdLyQgND86SkQrKJmjUn/+hqzakGC+/XTjtGt40O7+QWlZ6/dR9NhJ+P7I9vA2+uz3+dT6/vDe+fr///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////6S2qAAAAAQ70lEQVR42u2bd1jT97fHISEkbAgkbJCpuLfVzt8PEBIbMiEhCSGTEBpDIKxi2FOmgAxBpiiguEfds+5VtY7aYXfvb/Q37t73ns83QIW2z++PBPDeh/O0iON5eD3nvM/7nPNNYmU1F3MxF3MxF3MxF/+Xg4jiVQJaERYasDTCAU+0elXAbP0O/fa3r3t7r8ZZEUmkV6JmtsFnxGK5nDM/aAWeRCLONo4VIczfZ76YDUjilhbvQByJNLuJAulEzGupPcRhKxgsoTiNszjCHUewmU1BEQn2S/fWpimEKSwGPUWuZHsvXhwc6Gwzi9WzDgkO9uZwZAyhUglUjJQtEN4B1nazh2TvvYWjjFWkyKR8voxOp6co5WlbvP0CQ/zXWc1C9Yjr/MN89m4RG8oYdDmbzZbKUuh0SFRa2pba2hYq+MGMM5FCvFtaatPEBpbBkKZMlbL50jKonVCmUMrFtb7ODjjbmdY5aTX/DEdDZ9HpcrE4NTY2FeQkZDFYyfHJ5Z21ry9e/Iaj3UwmihRGpcznb+bIyuh0ljLWFGI2h81iJCcnf7RbfOYMf2+oky1p5vKEC67dVKuRstPkCrpQqjAhaVLZaUJGeXL8R7v5IK6WJfPDl1rPWJZwizliOUsBP1jOgDwZTEyp7M7ybcnJ9SwNQhKLt3hTCDM0YXChPvM38+X0cSR6CkZk0Gj64kFJQj5fLlNIleAHwb7UMMIMVM+G6t1Sq9BoWAoOn5+mkRmEKZpYhULGoNeXJyeXl6ewkUkxyqRs+PtNe0Pt7KZz7tlFrFjn4BFyCFJEZ0DBZBoxH3IC37JY8Af1yfHx8dtkbDbyTYZMmSYWi73DnAg204Zkh1+6ZsOCu2ugnaSMMvRTGSwxn8NJA6Cy+noGi/7J7t2762UGmZBOF7LoZQwNG8aeX2CozXQVz+edNRt6uktEiTfQMqIAt6YL2Xw+UrK8DERUTudv3rw5jYGlCBxBw1BwOGw2f5OfvbWNjc10jJDw0cTR4z3F3Q334UfzYdoCkhghQdDjwZBYHI5UoYEygrjZaByDlYOX8/3WOdpNBxIhbE13z/HjxXl5xdc/3nctlSOVYcrWSMWAhGUphcOBmQLlREOPAz4hFcKIEbO95/sFTIcbBCy4MWrsLj4aFVUsEpWULBBDUfga0BNdqpQrP+nrKy8HYQOSQQGi56SlpgJYCkokFLbWL5Rg+TUqdJ9odLQrLwoiOqdLdFcOuy1bA7qhs/qgaAx+mlIuM0COpBw+OzUVxp6czRFCFaXQd/zaJaHWFp95odeMPd11iCgvLy868cndu79LZWuEwjJGGdhRsgE0pURVo8vTlNIxO5crFaz622BU4jO1PjhrGwsj+ewzmnKE4mhiYqLI+LESSlfe19fX2blNAVNXipqNnjI2XyDkHDF9d3x83zah8kN/R7ydRe3J1oECSONEUdF1R7u6RTcMSrEBtpHb0HZSFgo6VsgJpDS+mNGZjMqa+iHFHWdtUST/ZStvjNZFTYoG4+i5f90NSPViMdwosF6mgUex6EKNxkSkkCkULIRULoz9kOJsb1Ekm8B21blR1G4vRTHY5r/EQ6fdlkrlyKXQxsuHvjfNYYNMRt+2bVtf5yeduw2phyjOMFksZ0kREeHtGedEoyXjdYse+1V0/dP7++RpUk0KVjHIEl8BE1iWYjAYYOqVJaMcxkL7WRjJNvC1lQ8lWd9+e7x7ClKOKNGYeH8LjF4FhgSurQS/4sgZaI2CyYfpKFaJbmF/ZydriyHh54+o1Vk6XeO5nu7inJ8kjn05KgIvfxKrNAhN4mYgL1ei7zq3dXbCivmRMHXzpk213kGAZCEtOS4NWNIeJ8nSnc7/8Ys/GI9ORsqLKjGKRKInfNR0KDEsQOJLEVsfFK3MwCrTSMeQLCVvUkj/qlWVanWuLj0yUv+goWu8aFHjeqqr6xJdO8PfzFcihbPkyKBQ0WALT8YsSroJkOYFWAzJZrlardbxeDqdPjIy8kFicV1dzgTUGF50g/H49WfXlGUMky8JFWDlDCBKjo2FdWUzhuTpYBkkj4gVayUxKoGusbGRhpAazp9PTCyeitQDS5ToBj9VI0thYdsS1NGwGzw9NnUTFi0tSzzh2DQfiWi7uv9pf3Z2tq5RPzAASFXaH7/44sL54pfMaZyqS3RjjRySgw3iMpYMDgI0e01Ih4J9/V3cLYFkjV/OVKkLeTxBTSSNhpB27kz/7sL5xJ7oyUjwpXh0VJT4sWntZnXCDn47FZu8JqQQN7IrzDizx+66gID1EolaUHj6yulI2tmmnVWXn5/9+tYPF4wlP0c62lPSYLwhFstA2UKEVB/L3rSJv9mE5Ovm4m5v7iZAtLJe3t/WVqnK1tXQEhJoX58senSroHl4uGL4B2PPpMqZAtYD46f7ri2AGdIJ2wogmXA+3Dtv3hKKi4MTwdx9ycaKsHw/MyYLWu2KPqGqabioeTtE0qWKiv809tRFR0dPhYo6OpooEh3/CM7LZBhtZeNIi70CFrk5O+KtzSVaGuazfoTJzOXVXCnVJwBRUfOxY8eStm49VvQno9EIbZc3FSmnu6QkEZCSQUdoqxxHCiCTye7mL3C4ZS9OHKhUqQS89IRI2uWOiqKCpI0okpIKfrhw7pxIVPyz0kXDBpxo/DQeTVqlUopMu2Xv3nl+ni7O7vYE8/Y3Ionk0c9kMlHVkEOeHa6oaE4aQ9pe8dnjs1/+eKF4KhCKo4AEk7Y+lj/mR4FeXgtdnB1x5grJg0IN7FehqhXqCsEgIx93ANEY0rGK4abMzC8/Hy/cJKQ6UeL92/X1hp+QPN1cHRxxZp8CYasOHGyvzs0S6PLT07WAVNXUsXXrVgxpe3PBY73+u+/+3LUrL28qEvpdgyjx+O8wHbVAq1HJLhiRWQc4yZpA7VUx1ahounStFiENXC5KmkD66vBhfdN//bmhpKSna2qWonNyShpEx1PFKEXe/kEL3VzdnfDWZupoxRvL1/cyJdm8xtLSK2NIt4oKCpJMSMeGB5qGf9/x2X/86XPjaPEEUg5EdPTNHTtu3rx46ripat5ebuCQTnhbM49KR0rv/rjWbHU1DJGEhEgstLcqKioumbS0MemrjuaNyKD+zmgsHqNBMMBy8YP33oX44PqCu2daXn99yUIXV2g1c5/sEt542K5W87jYXJsI2qOOS2Py3rjx/e2XwAqSkgCpKwrrfGD64D1E8x4WO0ZFon3B/v5eYJDQ/Ob6kePbGdXVubwrpaWnS7UTSDu1J7dOIJncKSnpH4xGUUlO1A5UrJvvvRQ7iotF+/w83cjOHmY3Pygp4qkkV6cDf8xM+ClJkWefV2yfhISo/n7UaGzIyTMVaxJSXpRoX6Cbi7OHvflEVqSIp3ECna4wvarqJaKq5xXIK6cg/ePnMFgaAGlq3IRj6loI2QIGiZJkt6JflSsAf5yUpMimkxUF26cgbbz0T6OwI+2aQELfoIS9ezMqZ/RaCKxs5j8rIRJJoX5vHYhT5equnE7XvpymsycvmQSUZBISGGdSwT8DUoMJ6d0PMKCLu05dvHhxV13X9Q2+aGUzP0dEEvVERmUcM1fH5eZPQtr5qHkKUlJBUUfHv10Q7cIyBDC7Tp26mIeZAnho9xNfZ0eC+Q9vrPG41b3quDhmNZfLvZKfn04bRxq41VFUsHHrsYLtW99/P6m5+RIiKioabrqAZQmKdeqlmSL6eMGTNT7o3jYXCf/G2rXz2iUxMTGq6iyBIDe3Bm6AMS11AEDBpYKCgu3vf/ZZR0VzMyJ6fvbLc6Lio3V5ebtOTSxPMPiMG3wpXi4O9uY/4nJ/qFbvr0RIWKIEgHT4sAlJ/xiYLj+CsdJx+euTBQVfNZ0sKLp1uOrLc+fhiDovEpWMHcE5DaKSEuMGL0+yq4cFHietW6VWSyQICSKLC0O3sLEmH3k3TU97PHy5qurycEeTVnv4q+eHqw7//pGWVnX4iwcPHvzhm28uYHd5Xl5enej777/v3uBFdnUATzJb3BH9TEkcJIiJkKoFAgEX/s/XarFzST9QRYukNTXp4Xf6AS36U2zSwH+nC498e64YTmBA6rq+AOKdAJj/BFvz+23pC7UK1YwZhyJGBQYlEJTm52NIMILRVz1C0mJhKml6Y02j7t+/KRFBNPR0lzx7x8craCG6R2zN7zfiilV//GMlE6CuDh7Zg4kcMQl06TRa5K9GeqFOJ9D99//89a9/+cuNZ8+e3X/H09PFFe4RCxBZEXE+gfMPoBwNZmYewTQF2zeXWziRkV+KfB6PK6jOqs7IyBhZHxju50chu2CbrSUeKBOt7Z2ovSakhNLBI3dUAJULSOBPvwKlT9eXIiRQH7Nyf/uyIE83OLQdHO3xlnnsTrQjOFEPqlUSyZ47Rwa1mfrWOFB5FjgUHJe/nKJSaErwr1xAOrhs7durF7lBzbDF1jIvThBtrPFhy1aufHsE+k5Fi0zf09qKcoZZ+S/waBMSAImXBeVlqpgHVwctXAQZ8nDCEWwt9fIbkWRnbU9eFOA7AjJqzczMhMJcjYkDOfF4NS9Pl3EVlZbWICTozvaD7QdCyGRXWJDwBEu+VAJMBHt3Zyhehrr1yJHB/MiEq2CdTLU6O5er4+VPMJlcoYYLw5nLrYZ/8mZw+OogTNUoQxZ98QYxeVBOtLdXMiWSyiGadmjwyFXknqByXvrAFCSdjlsNJQPkN3093dCRjanasi/dYHly8w0J/w2IXDKkh/bPLAUklQA1nn4yUiNULRtw20+cWOmP9mzzb5Ff0xPO0d3nzUoYK6rWe1f1mUNYlsA0dYWF+WNI4NmFjTyoWjZI+0QgleLpYokj+9e2OOg7x7A396vV0NmSVj14T/6QKi4GmSY3/2XP5mars1Wq7OwXPlA1Bye89bS964UIfbc0eNnKh/sB6Z4elnBtPigrDiGNbQb69FKejisAGTF729pe83JzRUTT93YzrHYOngHLR1QqFbO19d5QZGmrSoWZJleA1a4UqginJ3hWTJsvxQc7+21tpvFdHKh2OEcP6qq2tgNoJRjC8rInLk4CiYIVqrGmBohys6rjoJ79Xm7YajStRKba4RzJQV6UlRKozRAtMzIBIcUhjaPFDoTEq5Yw43pPnHjLi+xsWo2mGQlqh3fycF70NrNVxVTtuZceqb+zp5Wpzs5GyyYP9RrkiNkWSPF3G3sQYTXNQSTZ2BJwjm7LDvSOwCauSofaZQ7cgURlo0QJsrOrs1XqmDYqVM3diTAjbzAjokQRnIJ8w9EC1QpItIGBe2gxZ0LfVzPjJNBrL97yN63YM/T2MixReEdKr1oN+2Vr69DAwNCRO/fQWg4mxczI6PelUj1nLEcTicLbU9p6D45As1UOZaIoxU4FJkJaFUR2m1kiLFEEvIs/NfwhOKXk6uDgkJ42iB1UzJGnT/vXBpCxpX9m39FJtLHFOzl79beqKsG+mVcTMu+AsqCO7cE+XgvJM9RrPx94HqFvHeg9uB+EvWdwcI8KLpj2kd5wT9MDLduZfyM1MnKPIArVbwQuEEzXTPXBYL9gH0SEm1kd/dR3YJoO5PCD+/dXZsTEAFh1L3URXGrTOvr/du2cHKjLl68/AUgxbb9pe0hBG+S0jv6/rXGCvYOzi++LGLVatYRCpS4yPamdxffjE23sYLg4BK1f9tprr4Uvwm7H2ZHRlCls7+G6aOFCaH1T0exm/cMd2BR2cHVxGb+MZv1TOURTohzd3T2we9/mlficECjKGo/DoWPWhvSKfKIKLMrO1tbu1QEylY/4yn3obC7mYi7+P8T/Aj9HXXj0pb/jAAAAAElFTkSuQmCC";
		}
	});
	if (req.session.authenticated) {
		res.redirect("/report");
	} else {
		res.status(401).render("login", {
			error: "Invalid username or password",
		});
	}
});

app.get("/logout", (req, res) => {
	req.session = null; // clear cookie-session
	res.redirect("/login");
});

app.get("/avatar", (req, res) => {
	res.send(avatar);
});

app.get("/list", (req, res) => {
	if (req.session.authenticated) {
		res.status(200).render("list");
	} else {
		res.status(401).render("login", {
			error: "user not authenticated",
		});
	}
});

app.post("/list", (req, res) => {
	if (req.session.authenticated) {
		res.status(200).render("list");
	} else {
		res.status(401).render("login", {
			error: "user not authenticated",
		});
	}
});

app.get("/report", (req, res) => {
	if (!req.session.authenticated) {
		// user not logged in!
		res.status(401).render("login", {
			error: "user not authenticated",
		});
	} else {
		res.status(200).render("report", { username: req.session.username });
	}
});

app.post("/report", (req, res) => {
	// report a rider Kenny
	// add rider to database if not exist
	// add reporter to rider's reports array
	let Rider = mongoose.model("Rider", riderSchema);
	Rider.findOneAndUpdate(
		{ sid: req.body.sid },
		{ name: req.body.name },
		{
			$push: {
				reports: {
					username: req.session.username,
					courseCode: req.body.courseCode,
					remarks: req.body.remarks || "",
				},
			},
		},
		// {},
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
							courseCode: req.body.courseCode,
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

app.get("/register", (req, res) => {
	res.status(200).render("register", { msg: "" });
});

app.post("/register", (req, res) => {
	// register a new user, if duplicate entry, return error msg, else return success msg
	let NewUser = mongoose.model("User", userSchema);
	let type = req.body.admin ? "admin" : "user";
	let newUser = new NewUser({
		username: req.body.username,
		password: req.body.password,
		sid: req.body.sid,
		avatar: req.body.avatar,
		type: type,
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
	res.status(200).render("search", {
		error: "",
	});
});

app.post("/search", (req, res) => {
	console.log(req.body);

	let name = req.body.name;
	let year = req.body.year;
	let course = req.body.course;

	let Rider = mongoose.model("Rider", riderSchema);
	let riders = Rider.find({ name: name, reports: { courseCode: course } });
	console.log("Free Riders", freeRiders);

	var tbodyRef = document
		.getElementById("listTable")
		.getElementsByTagName("tbody")[0];
	freeRiders.forEach((element) => {
		var row = tbodyRef.insertRow();
		var nameCell = row.insertCell(0);
		var yearCell = row.insertCell(1);
		var programCell = row.insertCell(2);
		var timeCell = row.insertCell(3);

		nameCell.innerHTML = element["name"];
		yearCell.innerHTML = element["year"];
		programCell.innerHTML = element["program"];
		timeCell.innerHTML = element[""];
	});
});

process.env.PORT = process.env.PORT || 8099;
app.listen(app.listen(process.env.PORT));
console.log(`Server running at http://localhost:${process.env.PORT}/`);
