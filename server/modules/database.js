const {JsonDB} = require('node-json-db');
const {Config} = require('node-json-db/dist/lib/JsonDBConfig')

const db = new JsonDB(new Config('data', false, true, '/'));

// Init database
function init() {
    // First initialization of db with empty players
    if (Object.keys(db.getData('/')).length === 0 && db.getData('/').constructor === Object) {
        db.push('/players', []);

        console.log(`[DB] Initializing new database!`);
    }

    // Reset player status on init
    for (let i = 0; i < db.getData('/players').length; i++) {
        db.push(`/players[${i}]/online`, false);
        db.push(`/players[${i}]/ready`, false);
        db.push(`/players[${i}]/matchID`, false);
        db.push(`/players[${i}]/socketID`, false);
        db.push(`/players[${i}]/index`, i);
    }

    // Clear all matches
    db.delete('/matches');
    db.push('/matches', []);
    db.save();

    console.log(`[DB] Database loaded!`);
}

module.exports = {init, db};
