const io = require('socket.io-client');
const {JsonDB} = require('node-json-db');
const {Config} = require('node-json-db/dist/lib/JsonDBConfig')
const config = require('./config');

const db = new JsonDB(new Config('test', true, true, '/'));
const players = db.getData('/players');

const socketURL = `http://${config.host}:${config.port}`;
const options = {
    transports: ['websocket'],
    'force new connection': true
};

// Connect all players in test.js
for (let i = 0; i < players.length; i++) {
    const client = io.connect(socketURL, options);

    // Ready player upon receiving player data
    client.on('player_data', function(data) {
        setTimeout(function() {
            client.emit('player_ready', {index: data.index});
        }, Math.random() * 10000);
    });

    // End game upon receiving match details
    client.on('match_ready', function(data) {
        setTimeout(function() {
            client.emit('end_game', {index: data.index});
        }, Math.random() * 10000);
    });

    // Restart matching process after game ends
    client.on('end_game', function(data) {
        setTimeout(function() {
            client.emit('player_data', {name: data.data.name});
        }, Math.random() * 10000);
    });

    // Start by getting player data
    client.emit('player_data', {
        name: players[i].name,
    });
}