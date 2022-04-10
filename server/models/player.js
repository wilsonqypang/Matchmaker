const db = require('../modules/database').db;

// Player object for storing player details
class Player {
    constructor(name, socketID) {
        this.name = name || '';
        this.wins = 0;
        this.losses = 0;
        this.rating = 1500;
        this.online = true;
        this.ready = false;
        this.matchID = false;
        this.socketID = socketID || false;
        this.index = db.getData('/players').length;
    }

    // Reset connection when returning player joins
    resetConnection(socketID) {
        this.online = true;
        this.ready = false;
        this.matchID = false;
        this.socketID = socketID;
    }

    // Update player stats with rating
    updateStats(ratingChange) {
        this.rating += ratingChange;
        if (ratingChange > 0) {
            this.wins += 1;
        } else {
            this.losses += 1;
        }
    }

    // Add new player to db
    addToDB() {
        db.push('/players[]', this);
        return db.getData('/players').length - 1;
    }

    // Push changes for existing player
    pushToDB(index) {
        db.push(`/players[${index}]`, this);
    }

    // Get player index from name
    static getPlayerIndex(name) {
        return db.getData('/players').findIndex(item => item.name === name);
    }

    // Get player data from index
    static getPlayerData(index) {
        let player = new Player();
        Object.assign(player, db.getData('/players')[index]);
        return player;
    }

    // Set player to ready
    static readyPlayer(index) {
        db.push(`/players[${index}]/ready`, true);
    }

    // Set ready to false and match ID when match is ready
    static readyMatch(index, matchID) {
        db.push(`/players[${index}]/ready`, false);
        db.push(`/players[${index}]/matchID`, matchID);
    }

    // Disconnect player
    static disconnect(socketID) {
        let index = db.getData('/players').findIndex(item => item.socketID === socketID);
        db.push(`/players[${index}]/online`, false);
        db.push(`/players[${index}]/ready`, false);
        db.push(`/players[${index}]/matchID`, false);
        db.push(`/players[${index}]/socketID`, false);
    }

    // Get list of players that are ready for a match
    static getReadyPlayers() {
        let players = db.getData('/players');
        let readyPlayers = [];
        for (let i = 0; i < players.length; i++) {
            let player = new Player();
            Object.assign(player, players[i]);
            if (player.online === true && player.ready === true && player.matchID === false) {
                readyPlayers.push(player);
            }
        }
        return readyPlayers;
    }
}

module.exports = {Player};
