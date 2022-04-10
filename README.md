# Matchmaker
A nodeJS game room matchmaker system.
Did this to learn and practice nodeJS.

# How to use
Install NodeJS
Using commandline
cd into server folder and run 'npm install' and 'npm start'
cd into client folder and run 'npm install' and 'npm start'
You can run multiple clients with 'npm start' to connect to server
Press ctrl+c to stop server and client

# Testing
cd into server folder and run 'npm test'
This will run mocha unit test

# Simulating multiple clients
Run the server
cd into client folder and run 'npm test'
This will run a test client that will connect to the server with the names in test.js
You can run the normal client while the test client is running

# Tools and library used
NodeJS - Chosen for ease of implementing sockets with Socket.io plugin
Socket.io - For socket connection
JsonDB - Json parser that works like a db, no need to install another program for db
Mocha - For unit and integration testing
Nyc - For test coverage
Chai - For asserts in unit testing
Sinon - For hiding of logs during unit testing

# Configs files
client/config.js
host - IP address of server
port - Port the server is listening to

server/config.js
port - Port to listen to
eloKValue - ELO k value for controlling how much rating changes per match
teamSize - Size of each team, each match will have 2x teamSize players
