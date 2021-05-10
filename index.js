const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const usernames = [];
server.listen(3000);
console.log("Server Running");

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

io.of("/").on("connection", (socket) => {
	console.log("Socket Connected ...");

	socket.on("new user", (data, callback) => {
		if (usernames.indexOf(data) != -1) {
			callback(false);
		} else {
			callback(true);
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
		}

		// Update usernames
		function updateUsernames() {
			io.of("/").emit("usernames", usernames);
		}
	});

	// Send message
	socket.on("send message", (data) => {
		io.of("/").emit("new message", { msg: data, user: socket.username });
	});

	// Disconnect
	socket.on("disconnect", (data) => {
		if (!socket.username) {
			return;
		}
		usernames.splice(usernames.indexOf(socket.username), 1);
		updateUsernames();
	});
});
