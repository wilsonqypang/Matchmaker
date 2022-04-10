const config = require('../config');

let k = config.eloKValue;

// Get expected win rate
function getExpected(a, b) {
    return 1 / (1 + Math.pow(10, ((b - a) / 400)));
}

// Get the amount of rating change given the result
function getRatingChange(expected, actual) {
    return k * (actual - expected);
}

// Get the average rating of the team
function getTeamRating(team) {
    let teamRating = 0;
    for (let i = 0; i < team.length; i++) {
        teamRating += team[i].rating;
    }
    return teamRating / team.length;
}

// Set k value for testing
function setKValue(kValue) {
    k = kValue;
}

module.exports = {getExpected, getRatingChange, getTeamRating, setKValue};
