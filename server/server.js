const database = require("./modules/database");
const socket = require("./modules/socket");
const matchmaker = require("./modules/matchmaker");

// Init systems
database.init();
socket.init();
matchmaker.init();

console.log("[SYSTEM] Server running");

// Save db on exit
process.on("SIGINT", function() {
    database.db.save();
    process.exit();
});