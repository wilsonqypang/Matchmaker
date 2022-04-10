const db = require('../modules/database').db;
const Player = require('./player').Player;

// Match object for storing match details
class Match {
    constructor(team1, team2) {
        this.team1 = team1;
        this.team2 = team2;
    }

    // Save player index matchup to db
    addToDB() {
        let team1 = this.team1.map(player => player.index);
        let team2 = this.team2.map(player => player.index);
        db.push('/matches[]', { 'team1': team1, 'team2': team2 });
    }

    // Get match from match ID
    static getMatch(matchID) {
        let match = db.getData('/matches')[matchID];

        let team1 = [];
        let team2 = [];

        for (let i = 0; i < match.team1.length; i++) {
            let player = Player.getPlayerData(match.team1[i]);
            team1.push(player);
        }
        for (let i = 0; i < match.team2.length; i++) {
            let player = Player.getPlayerData(match.team2[i]);
            team2.push(player);
        }

        return new Match(team1, team2);
    }

    // Get the next index if a new match is created
    static getNextMatchID() {
        return db.getData('/matches').length;
    }
}

module.exports = {Match};
