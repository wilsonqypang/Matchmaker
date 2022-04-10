const io = require('socket.io-client');
const config = require('./config');

const socketURL = `http://${config.host}:${config.port}`;
const options = {
    transports: ['websocket'],
    'force new connection': true
};

let client = null;
let playerIndex = null;

// Connect to server
function init(playerData, onConnected, onMatched, onEnd) {
    client = io.connect(socketURL, options);

    // On connection error
    client.on('connect_error', function() {
        console.log("[SYSTEM] Connection failed!");

        setTimeout(function() {
            process.exit(1);
        }, 500)
    });

    // On connection error
    client.on('error', function() {
        console.log("[SYSTEM] Connection failed!");

        setTimeout(function() {
            process.exit(1);
        }, 500)
    });

    // Request for player data when connection successful
    client.on('connect', function() {
        console.log("[SYSTEM] Connection ready!");
        
        client.emit('player_data', playerData);
    });

    // Save player data
    client.on('player_data', function(data) {
        playerIndex = data.index;

        onConnected();
    });

    // Match ready
    client.on('match_ready', function(data) {
        console.log("Your match is ready!");

        onMatched(data);
    });

    // Disconnect when game ends
    client.on('end_game', function(data) {
        console.log("\nGame ended!");

        onEnd(data);
        client.disconnect();
    });

    // Duplicate player
    client.on('duplicate', function(data) {
        console.log("This player is already online!");

        client.disconnect();
        process.exit(1);
    });
}

// Send player ready message
function player_ready() {
    client.emit('player_ready', {
        index: playerIndex
    });
}

// Send end game message
function end_game() {
    client.emit('end_game', {
        index: playerIndex
    });
}

module.exports = {init, player_ready, end_game};