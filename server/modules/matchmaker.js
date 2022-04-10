const db = require('./database').db;
const io = require('./socket').io;
const Match = require('../models/match').Match;
const Player = require('../models/player').Player;
const config = require('../config');

let playerAmount = config.teamSize * 2;
let isSortAscending = true;
let matcher = null;

// Run matchmaker every few seconds to create matches
function init() {
    matcher = setInterval(function() {
        let groups = createGroups();
        createMatches(groups);

        db.save();
    }, 1000);

    console.log(`[MATCHMAKER] Matchmaker started!`);
}

// Stop matcher
function stop() {
    clearInterval(matcher);
}

// Create groups of ready players
function createGroups() {
    let players = Player.getReadyPlayers();

    if (players.length === 0) {
        return [];
    }

    console.log(`[MATCHMAKER] Players waiting for matches: ${players.length}`);

    let playerGroups = [];
    let tempGroup = [];

    // Group similar players by sorting
    players.sort((a, b) => isSortAscending ? a.rating - b.rating : b.rating - a.rating);
    
    // Alternate sorting direction to prevent top and bottom players from being left out
    isSortAscending = !isSortAscending

    // Fill players into tempGroup until full before pushing into playerGroups
    for (let i = 0; i < players.length; i++) {
        tempGroup.push(players[i]);

        if (tempGroup.length === playerAmount) {
            playerGroups.push(tempGroup);
            tempGroup = [];
        }
    }

    if (playerGroups.length > 0) {
        console.log(`[MATCHMAKER] Matches created: ${playerGroups.length}`);
    }

    return playerGroups;
}

// Create match data for saving and sending to client
function createMatches(groups) {
    for (let group = 0; group < groups.length; group++) {
        let team1 = [];
        let team2 = [];

        // Remove player ready status and split them into 2 teams
        for (let player = 0; player < groups[group].length; player++) {
            let playerIndex = groups[group][player].index;
            Player.readyMatch(playerIndex, Match.getNextMatchID());
            
            let playerData = groups[group][player];
            if (player % 2 == 0) {
                team1.push(playerData);
            } else {
                team2.push(playerData);
            }
        }

        // Create match object and save to db
        let match = new Match(team1, team2);
        match.addToDB();

        // Send match details to every player in the match
        for (let player = 0; player < groups[group].length; player++) {
            let playerIndex = groups[group][player].index;
            io.to(groups[group][player].socketID).emit('match_ready', {
                index: playerIndex,
                match: match
            });
        }
    }
}

// Set player amount for testing
function setPlayerAmount(amount) {
    playerAmount = amount;
}

module.exports = {init, stop, createGroups, createMatches, setPlayerAmount};
