const readline = require('readline');
const socket = require("./socket");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt for player name
rl.question("Enter your name: ", function(name) {
    if (name == '') {
        console.log("Name cannot be empty");
        rl.close();
    } else {
        let playerData = {'name': name}
        socket.init(playerData, onConnected, onMatched, onEnd);
    }
});

// Ready player after connecting and receiving data
function onConnected() {
    rl.question("Press enter to search for matches!", function() {
        socket.player_ready();
        console.log("Searching for matches!");
    });
}

// Print match and end game after matching
function onMatched(data) {
    // Print team 1
    console.log(`Team 1`);
    const team1 = data['match']['team1'];
    for (let i = 0; i < team1.length; i++) {
        const player = team1[i];
        console.log(`Name: ${player['name']}, Wins: ${player['wins']}, Losses: ${player['losses']}, Rating: ${player['rating']}`);
    }

    // Print team 2
    console.log(`Team 2`);
    const team2 = data['match']['team2'];
    for (let i = 0; i < team2.length; i++) {
        const player = team2[i];
        console.log(`Name: ${player['name']}, Wins: ${player['wins']}, Losses: ${player['losses']}, Rating: ${player['rating']}`);
    }

    rl.question("Press enter to end match!", function() {
        socket.end_game();
        rl.close();
    });
}

// Print result when game ends
function onEnd(data) {
    if (data['win']) {
        console.log("You won!");
    } else {
        console.log("You lost...");
    }
    let player = data['data'];
    console.log(`Wins: ${player['wins']}, Losses: ${player['losses']}, Rating: ${player['rating']}`);
}
