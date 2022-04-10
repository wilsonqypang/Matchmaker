const app = require('http').createServer();
const io = require('socket.io')(app);
const db = require('./database').db;
const elo = require('./elo');
const Match = require('../models/match').Match;
const Player = require('../models/player').Player;
const config = require('../config');

// Start socket
function init() {
    app.listen(config.port);
    console.log(`[SOCKET] Socket started on: ${config.port}`);

    // When a client connects to server
    io.on('connection', function(socket) {
        console.log(`[SOCKET] New client connected! Socket ID: ${socket.id}`);

        // Return player data when client requests for it
        socket.on('player_data', function(data) {
            let playerIndex = Player.getPlayerIndex(data.name);

            // Create new player when player name does not exist
            if (playerIndex === -1) {
                let player = new Player(data.name, socket.id);
                let playerIndex = player.addToDB();
                let playerData = Player.getPlayerData(playerIndex);

                socket.emit('player_data', {
                    index: playerIndex,
                    data: playerData
                });

                console.log(`[SOCKET][${socket.id}] New player! Name: ${data.name}.`);
            } else {
                let playerData = Player.getPlayerData(playerIndex);
                if (playerData.online) {
                    socket.emit('duplicate');

                    console.log(`[SOCKET][${socket.id}] This player is already online! Name: ${data['name']}`);
                } else {
                    playerData.resetConnection(socket.id);
                    playerData.pushToDB(playerIndex);

                    socket.emit('player_data', {
                        index: playerIndex,
                        data: playerData
                    });

                    console.log(`[SOCKET][${socket.id}] Returning player! Name: ${data['name']}`);
                }
            }
        });

        // Save player ready status when client is ready
        socket.on('player_ready', function(data, ack) {
            Player.readyPlayer(data.index);
            player = Player.getPlayerData(data.index);

            if (ack) {
                ack();
            }

            console.log(`[SOCKET][${socket.id}] ${player.name} is ready for match`);
        });

        // Calculate game results when client ends the game
        socket.on('end_game', function(data) {
            let matchID = Player.getPlayerData(data.index).matchID;
            
            // Do not calculate match result if end game call is invalid
            if (matchID !== false) {
                let match = Match.getMatch(matchID);

                // Calculate ELO rating
                let team1Rating = elo.getTeamRating(match.team1);
                let team2Rating = elo.getTeamRating(match.team2);
                let team1Expected = elo.getExpected(team1Rating, team2Rating);
                let team2Expected = elo.getExpected(team2Rating, team1Rating);
                
                // Randomly choose winner using expected win rate
                let team1Wins = Math.random() < team1Expected;
                let team1RatingChange = elo.getRatingChange(team1Expected, team1Wins ? 1 : 0) / match.team1.length;
                let team2RatingChange = elo.getRatingChange(team2Expected, team1Wins ? 0 : 1) / match.team2.length;

                updateStats(match.team1, team1RatingChange, team1Wins, socket);
                updateStats(match.team2, team2RatingChange, !team1Wins, socket);

                console.log(`[SOCKET][${socket.id}] Ending game`);
            }
        });

        // Disconnect player
        socket.on('disconnect', function() {
            console.log(`[SOCKET] Client disconnected! ID: ${socket.id}`);

            Player.disconnect(socket.id);
        });
    });
}

// Save db when closing server
function close() {
    db.save();
    app.close();
    console.log(`[SOCKET] Socket stopped`);
}

// Update player stats with result and send results to all players in match
function updateStats(team, ratingChange, isWin, socket) {
    for (let i = 0; i < team.length; i++) {
        let player = team[i];
        let playerIndex = player.index;
        player.updateStats(ratingChange);

        // Set match ID to false for all players to prevent double counting
        player.matchID = false;
        player.online = false;
        player.pushToDB(playerIndex);

        // Check if sending to self
        if (player.socketID == socket.id) {
            socket.emit('end_game', {
                win: isWin,
                data: player
            });
        } else {
            socket.to(player.socketID).emit('end_game', {
                win: isWin,
                data: player
            });
        }
    }
}

module.exports = {io, init, close};
